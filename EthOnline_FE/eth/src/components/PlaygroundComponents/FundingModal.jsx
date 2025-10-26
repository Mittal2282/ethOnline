import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { ethers } from 'ethers';
import contractABI from '../../data/abi.json';
import { contractService } from '../../services/contractService';

const FundingModal = ({ 
  isOpen, 
  onClose, 
  ethOappAddress, 
  hederaOappAddress 
}) => {
  const [ethAmount, setEthAmount] = useState('');
  const [hederaAmount, setHederaAmount] = useState('');
  const [ethBridgeAmount, setEthBridgeAmount] = useState('');
  const [hederaBridgeAmount, setHederaBridgeAmount] = useState('');
  const [isProcessingEth, setIsProcessingEth] = useState(false);
  const [isProcessingHedera, setIsProcessingHedera] = useState(false);
  const [isProcessingEthBridge, setIsProcessingEthBridge] = useState(false);
  const [isProcessingHederaBridge, setIsProcessingHederaBridge] = useState(false);
  const [ethError, setEthError] = useState('');
  const [hederaError, setHederaError] = useState('');
  const [ethBridgeError, setEthBridgeError] = useState('');
  const [hederaBridgeError, setHederaBridgeError] = useState('');
  
  // Balance states
  const [ethUserBalance, setEthUserBalance] = useState('0');
  const [ethBridgeBalance, setEthBridgeBalance] = useState('0');
  const [hederaUserBalance, setHederaUserBalance] = useState('0');
  const [hederaBridgeBalance, setHederaBridgeBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Track previous tx data to detect new transactions
  const [prevEthTxData, setPrevEthTxData] = useState(null);
  const [prevHederaTxData, setPrevHederaTxData] = useState(null);
  
  const { isConnected, chainId, address } = useAccount();
  const { writeContract: writeEthContract, isPending: isEthPending, data: ethTxData, error: ethWriteError } = useWriteContract();
  const { writeContract: writeHederaContract, isPending: isHederaPending, data: hederaTxData, error: hederaWriteError } = useWriteContract();
  const { switchChain } = useSwitchChain();

  // Track transaction success for ETH
  useEffect(() => {
    if (ethTxData && ethTxData !== prevEthTxData && isProcessingEth) {
      setPrevEthTxData(ethTxData);
      showToast('ETH deposited successfully to contract!', 'success');
      fetchContractBalances();
    }
  }, [ethTxData, prevEthTxData, isProcessingEth]);

  // Track transaction success for Hedera
  useEffect(() => {
    if (hederaTxData && hederaTxData !== prevHederaTxData && isProcessingHedera) {
      setPrevHederaTxData(hederaTxData);
      showToast('HBAR deposited successfully to contract!', 'success');
      fetchContractBalances();
    }
  }, [hederaTxData, prevHederaTxData, isProcessingHedera]);

  // Track write errors
  useEffect(() => {
    if (ethWriteError && isProcessingEth) {
      showToast(ethWriteError.message || 'Transaction failed', 'error');
      setIsProcessingEth(false);
    }
  }, [ethWriteError, isProcessingEth]);

  useEffect(() => {
    if (hederaWriteError && isProcessingHedera) {
      showToast(hederaWriteError.message || 'Transaction failed', 'error');
      setIsProcessingHedera(false);
    }
  }, [hederaWriteError, isProcessingHedera]);

  // Reset processing state when transaction succeeds
  useEffect(() => {
    if (ethTxData && ethTxData !== prevEthTxData && isProcessingEth) {
      setIsProcessingEth(false);
    }
  }, [ethTxData, prevEthTxData, isProcessingEth]);

  useEffect(() => {
    if (hederaTxData && hederaTxData !== prevHederaTxData && isProcessingHedera) {
      setIsProcessingHedera(false);
    }
  }, [hederaTxData, prevHederaTxData, isProcessingHedera]);

  const buttonStyles = {
    primary: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md",
    ghost: "px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm",
    disabled: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-500 cursor-not-allowed rounded-md font-medium text-sm transition-all duration-200 shadow-sm"
  };

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Copy to clipboard handler
  const copyToClipboard = (text, addressType) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${addressType} address copied to clipboard`, 'success');
    }).catch(() => {
      showToast('Failed to copy address', 'error');
    });
  };

  // Funding functions
  const handleEthFunding = async () => {
    if (!ethAmount || !ethOappAddress || !isConnected) {
      setEthError('Please enter a valid amount and ensure wallet is connected');
      return;
    }

    setIsProcessingEth(true);
    setEthError('');

    try {
      // Switch to Sepolia if not already on it
      const sepoliaChainId = 11155111; // Sepolia chain ID
      if (chainId !== sepoliaChainId) {
        await switchChain({ chainId: sepoliaChainId });
      }

      const contractConfig = contractService.getContractConfig(ethOappAddress);
      const transactionData = contractService.prepareDepositTransaction(ethAmount);
      
      await writeEthContract({
        ...contractConfig,
        ...transactionData,
      });
      
      // Clear the input
      setEthAmount('');
    } catch (error) {
      console.error('ETH deposit error:', error);
      const errorMessage = error.message || 'Failed to deposit ETH to contract';
      setEthError(errorMessage);
      showToast(errorMessage, 'error');
      setIsProcessingEth(false);
    }
  };

  const handleHederaFunding = async () => {
    if (!hederaAmount || !hederaOappAddress) {
      setHederaError('Please enter a valid amount');
      return;
    }

    setIsProcessingHedera(true);
    setHederaError('');

    try {
      // Switch to Hedera testnet if not already on it
      const hederaChainId = 296; // Hedera testnet chain ID
      if (chainId !== hederaChainId) {
        await switchChain({ chainId: hederaChainId });
      }

      // Get Hedera contract config
      const contractConfig = contractService.getContractConfig(hederaOappAddress);
      const transactionData = contractService.prepareDepositTransaction(hederaAmount);
      
      await writeHederaContract({
        ...contractConfig,
        ...transactionData,
      });
      
      // Clear the input
      setHederaAmount('');
    } catch (error) {
      console.error('Hedera deposit error:', error);
      const errorMessage = error.message || 'Failed to deposit HBAR to contract';
      setHederaError(errorMessage);
      showToast(errorMessage, 'error');
      setIsProcessingHedera(false);
    }
  };

  // Bridge funding handlers
  const handleEthBridgeFunding = async () => {
    if (!ethBridgeAmount || !ethOappAddress || !isConnected) {
      setEthBridgeError('Please enter a valid amount and ensure wallet is connected');
      return;
    }

    setIsProcessingEthBridge(true);
    setEthBridgeError('');

    try {
      // Switch to Sepolia if not already on it
      const sepoliaChainId = 11155111; // Sepolia chain ID
      if (chainId !== sepoliaChainId) {
        await switchChain({ chainId: sepoliaChainId });
      }

      const contractConfig = {
        address: ethOappAddress,
        abi: contractABI,
        functionName: 'depositProtocolFunds',
        value: ethers.parseEther(ethBridgeAmount),
        gasLimit: 100000
      };
      
      await writeEthContract(contractConfig);
      
      // Clear the input
      setEthBridgeAmount('');
      showToast('ETH bridge funds deposited successfully!', 'success');
      // Refresh balances
      await fetchContractBalances();
    } catch (error) {
      console.error('ETH bridge deposit error:', error);
      const errorMessage = error.message || 'Failed to deposit ETH bridge funds';
      setEthBridgeError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessingEthBridge(false);
    }
  };

  const handleHederaBridgeFunding = async () => {
    if (!hederaBridgeAmount || !hederaOappAddress) {
      setHederaBridgeError('Please enter a valid amount');
      return;
    }

    setIsProcessingHederaBridge(true);
    setHederaBridgeError('');

    try {
      // Switch to Hedera testnet if not already on it
      const hederaChainId = 296; // Hedera testnet chain ID
      if (chainId !== hederaChainId) {
        await switchChain({ chainId: hederaChainId });
      }

      // Get Hedera contract config
      const contractConfig = {
        address: hederaOappAddress,
        abi: contractABI,
        functionName: 'depositProtocolFunds',
        value: ethers.parseEther(hederaBridgeAmount),
        gasLimit: 100000
      };
      
      await writeHederaContract(contractConfig);
      
      // Success - clear the input
      setHederaBridgeAmount('');
      showToast('HBAR bridge funds deposited successfully!', 'success');
      // Refresh balances
      await fetchContractBalances();
    } catch (error) {
      console.error('Hedera bridge deposit error:', error);
      const errorMessage = error.message || 'Failed to deposit HBAR bridge funds';
      setHederaBridgeError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsProcessingHederaBridge(false);
    }
  };

  const resetFundingForm = () => {
    setEthAmount('');
    setHederaAmount('');
    setEthBridgeAmount('');
    setHederaBridgeAmount('');
    setEthError('');
    setHederaError('');
    setEthBridgeError('');
    setHederaBridgeError('');
    setIsProcessingEth(false);
    setIsProcessingHedera(false);
    setIsProcessingEthBridge(false);
    setIsProcessingHederaBridge(false);
  };

  // Fetch contract balances
  const fetchContractBalances = async () => {
    if (!ethOappAddress && !hederaOappAddress) {
      return;
    }

    setIsLoadingBalances(true);

    try {
      // Fetch ETH contract balances
      if (ethOappAddress) {
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        const ethContract = new ethers.Contract(ethOappAddress, contractABI, provider);
        
        try {
          const userBal = await ethContract.userBalance();
          setEthUserBalance(ethers.formatEther(userBal));
        } catch (error) {
          console.error('Error fetching ETH user balance:', error);
          setEthUserBalance('0');
        }

        try {
          const bridgeBal = await ethContract.protocolBalance();
          setEthBridgeBalance(ethers.formatEther(bridgeBal));
        } catch (error) {
          console.error('Error fetching ETH bridge balance:', error);
          setEthBridgeBalance('0');
        }
      }

      // Fetch Hedera contract balances
      if (hederaOappAddress) {
        const hederaProvider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
        const hederaContract = new ethers.Contract(hederaOappAddress, contractABI, hederaProvider);
        
        try {
          const userBal = await hederaContract.userBalance();
          setHederaUserBalance(ethers.formatUnits(userBal, 8)); // HBAR uses 8 decimals
        } catch (error) {
          console.error('Error fetching Hedera user balance:', error);
          setHederaUserBalance('0');
        }

        try {
          const bridgeBal = await hederaContract.protocolBalance();
          setHederaBridgeBalance(ethers.formatUnits(bridgeBal, 8)); // HBAR uses 8 decimals
        } catch (error) {
          console.error('Error fetching Hedera bridge balance:', error);
          setHederaBridgeBalance('0');
        }
      }
    } catch (error) {
      console.error('Error fetching contract balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances on component mount and when contracts are available
  useEffect(() => {
    if (isOpen && (ethOappAddress || hederaOappAddress)) {
      fetchContractBalances();
    }
  }, [isOpen, ethOappAddress, hederaOappAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Deposit Funds to Contracts</h3>
          <motion.button
            onClick={() => {
              onClose();
              resetFundingForm();
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Contract Balances Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Contract Balances
              {isLoadingBalances && (
                <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* ETH Balances */}
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">Ethereum</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Transaction:</span>
                    <span className="text-xs font-semibold text-gray-900">{parseFloat(ethUserBalance).toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Bridge:</span>
                    <span className="text-xs font-semibold text-gray-900">{parseFloat(ethBridgeBalance).toFixed(6)} ETH</span>
                  </div>
                </div>
              </div>

              {/* Hedera Balances */}
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-2">Hedera</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Transaction:</span>
                    <span className="text-xs font-semibold text-gray-900">{parseFloat(hederaUserBalance).toFixed(6)} HBAR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Bridge:</span>
                    <span className="text-xs font-semibold text-gray-900">{parseFloat(hederaBridgeBalance).toFixed(6)} HBAR</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={fetchContractBalances}
              disabled={isLoadingBalances}
              className="mt-3 w-full text-xs py-1.5 px-2 bg-white hover:bg-gray-50 text-gray-700 rounded-md border border-gray-300 transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Balances
            </button>
          </div>

          <div className="space-y-4">
            {/* Ethereum Funding */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ethereum (ETH)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={ethAmount}
                    onChange={(e) => {
                      setEthAmount(e.target.value);
                      setEthError('');
                    }}
                    placeholder="0.0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      ethError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isProcessingEth || isEthPending}
                  />
                  {ethError && (
                    <p className="text-xs text-red-600 mt-1">{ethError}</p>
                  )}
                </div>
                <motion.button
                  onClick={handleEthFunding}
                  disabled={!ethAmount || isProcessingEth || isEthPending}
                  className={
                    !ethAmount || isProcessingEth || isEthPending
                      ? buttonStyles.disabled
                      : buttonStyles.primary
                  }
                  {...motionProps}
                >
                  {isProcessingEth || isEthPending ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Depositing...
                    </div>
                  ) : (
                    'Deposit ETH'
                  )}
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  To: {ethOappAddress ? `${ethOappAddress.slice(0, 6)}...${ethOappAddress.slice(-4)}` : 'Not available'}
                </p>
                {ethOappAddress && (
                  <motion.button
                    onClick={() => copyToClipboard(ethOappAddress, 'ETH')}
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Copy address"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Hedera Funding */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Hedera (HBAR)
              </label>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={hederaAmount}
                    onChange={(e) => {
                      setHederaAmount(e.target.value);
                      setHederaError('');
                    }}
                    placeholder="0.0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                      hederaError ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isProcessingHedera}
                  />
                  {hederaError && (
                    <p className="text-xs text-red-600 mt-1">{hederaError}</p>
                  )}
                </div>
                <motion.button
                  onClick={handleHederaFunding}
                  disabled={!hederaAmount || isProcessingHedera || isHederaPending}
                  className={
                    !hederaAmount || isProcessingHedera || isHederaPending
                      ? buttonStyles.disabled
                      : buttonStyles.primary
                  }
                  {...motionProps}
                >
                  {isProcessingHedera || isHederaPending ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Depositing...
                    </div>
                  ) : (
                    'Deposit HBAR'
                  )}
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  To: {hederaOappAddress ? `${hederaOappAddress.slice(0, 6)}...${hederaOappAddress.slice(-4)}` : 'Not available'}
                </p>
                {hederaOappAddress && (
                  <motion.button
                    onClick={() => copyToClipboard(hederaOappAddress, 'HBAR')}
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Copy address"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.button>
                )}
              </div>
              <p className="text-xs text-blue-600">
                ℹ️ Wallet will prompt to switch to Hedera Testnet for this transaction
              </p>
            </div>

            {/* Bridge Funding Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-4">Bridge Deposits</h4>
              
              {/* ETH Bridge Funding */}
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  ETH Bridge Deposit
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={ethBridgeAmount}
                      onChange={(e) => {
                        setEthBridgeAmount(e.target.value);
                        setEthBridgeError('');
                      }}
                      placeholder="0.0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        ethBridgeError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isProcessingEthBridge}
                    />
                    {ethBridgeError && (
                      <p className="text-xs text-red-600 mt-1">{ethBridgeError}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleEthBridgeFunding}
                    disabled={!ethBridgeAmount || isProcessingEthBridge}
                    className={
                      !ethBridgeAmount || isProcessingEthBridge
                        ? buttonStyles.disabled
                        : buttonStyles.primary
                    }
                    {...motionProps}
                  >
                    {isProcessingEthBridge ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Bridging...
                      </div>
                    ) : (
                      'Bridge ETH'
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Hedera Bridge Funding */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  HBAR Bridge Deposit
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={hederaBridgeAmount}
                      onChange={(e) => {
                        setHederaBridgeAmount(e.target.value);
                        setHederaBridgeError('');
                      }}
                      placeholder="0.0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                        hederaBridgeError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isProcessingHederaBridge}
                    />
                    {hederaBridgeError && (
                      <p className="text-xs text-red-600 mt-1">{hederaBridgeError}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleHederaBridgeFunding}
                    disabled={!hederaBridgeAmount || isProcessingHederaBridge}
                    className={
                      !hederaBridgeAmount || isProcessingHederaBridge
                        ? buttonStyles.disabled
                        : buttonStyles.primary
                    }
                    {...motionProps}
                  >
                    {isProcessingHederaBridge ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Bridging...
                      </div>
                    ) : (
                      'Bridge HBAR'
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-blue-600">
                  ℹ️ Wallet will prompt to switch networks for bridge transactions
                </p>
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-base font-medium text-gray-900 mb-4">Withdraw Funds</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* ETH Withdraw */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Withdraw ETH
                  </label>
                  <motion.button
                    onClick={() => showToast('Withdraw functionality coming soon', 'info')}
                    disabled={parseFloat(ethUserBalance) <= 0}
                    className={`w-full px-3 py-2 rounded-md font-medium text-sm transition-all ${
                      parseFloat(ethUserBalance) <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-800 text-white'
                    }`}
                    {...motionProps}
                  >
                    Withdraw
                  </motion.button>
                  <p className="text-xs text-gray-500">
                    Balance: {parseFloat(ethUserBalance).toFixed(6)} ETH
                  </p>
                </div>

                {/* HBAR Withdraw */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Withdraw HBAR
                  </label>
                  <motion.button
                    onClick={() => showToast('Withdraw functionality coming soon', 'info')}
                    disabled={parseFloat(hederaUserBalance) <= 0}
                    className={`w-full px-3 py-2 rounded-md font-medium text-sm transition-all ${
                      parseFloat(hederaUserBalance) <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-800 text-white'
                    }`}
                    {...motionProps}
                  >
                    Withdraw
                  </motion.button>
                  <p className="text-xs text-gray-500">
                    Balance: {parseFloat(hederaUserBalance).toFixed(6)} HBAR
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Scrollable Content */}

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 bg-white rounded-b-lg">
          <div className="flex justify-end gap-2">
            <motion.button
              onClick={() => {
                onClose();
                resetFundingForm();
              }}
              className={buttonStyles.ghost}
              {...motionProps}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-gray-900 text-white border border-gray-700`}
          >
            {toast.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FundingModal;
