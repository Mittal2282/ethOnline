/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import orbixLogo from "../../../public/OrbixLogo.jpg";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  // Get MetaMask connector
  const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');

  const handleConnectWallet = () => {
    if (!metaMaskConnector) {
      alert('MetaMask is not installed. Please install MetaMask to connect your wallet!');
      return;
    }
    
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: metaMaskConnector });
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    if (!balance) return '0 ETH';
    return `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      className="relative z-50 bg-white border-b border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo */}
          <motion.div
            className="flex items-center"
            variants={itemVariants}
          >
            <img src={orbixLogo} alt="Orbix Logo" className="h-6" />
          </motion.div>

          {/* Right Section - Wallet Connection */}
          <motion.div
            className="flex items-center space-x-3"
            variants={itemVariants}
          >
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Info */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(address)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatBalance(balance)}
                  </div>
                </div>
                
                {/* Disconnect Button */}
                <motion.button
                  onClick={handleConnectWallet}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Disconnect
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={handleConnectWallet}
                disabled={isPending}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isPending 
                  ? 'Connecting...' 
                  : metaMaskConnector 
                    ? 'Connect Wallet' 
                    : 'Install MetaMask'
                }
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;