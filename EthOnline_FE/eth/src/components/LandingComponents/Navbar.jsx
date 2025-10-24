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
        <div className="flex justify-between items-center h-12">
          {/* Left Section - Logo */}
          <motion.div
            className="flex items-center"
            variants={itemVariants}
          >
            <img src={orbixLogo} alt="Orbix Logo" className="h-5" />
          </motion.div>

          {/* Right Section - Wallet Connection */}
          <motion.div
            className="flex items-center space-x-2"
            variants={itemVariants}
          >
            {isConnected ? (
              <motion.button
                onClick={handleConnectWallet}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-900 px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-200 flex items-center space-x-2 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Wallet Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-mono">{formatAddress(address)}</span>
                </div>
                
                {/* Balance */}
                <div className="text-gray-500 text-xs">
                  {formatBalance(balance)}
                </div>
              </motion.button>
            ) : (
              <motion.button
                onClick={handleConnectWallet}
                disabled={isPending}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all duration-200"
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