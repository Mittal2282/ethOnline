/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { usePlayground } from '../../hooks/usePlayground';
import { apiService } from '../../services/api';

const WorkflowBuilder = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentPhase, setDeploymentPhase] = useState(''); // 'checking', 'deploying', 'completed'
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(240); // 4 minutes in seconds
  const [currentTip, setCurrentTip] = useState(0);
  const [deploymentError, setDeploymentError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();
  const { setDeploymentAddresses } = usePlayground();

  const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');

  // Educational tips to show during deployment
  const deploymentTips = [
    {
      title: "Smart Contract Deployment",
      content: "Your contracts are being deployed to both Ethereum and Hedera networks for cross-chain functionality."
    },
    {
      title: "Cross-Chain Technology",
      content: "LayerZero technology enables seamless communication between different blockchain networks."
    },
    {
      title: "Security & Optimization",
      content: "Each deployment includes comprehensive security checks and gas optimization."
    },
    {
      title: "Automation Ready",
      content: "Once deployed, you'll be able to create automated workflows that trigger across chains."
    },
    {
      title: "Gas Efficiency",
      content: "Our contracts are optimized for minimal gas usage while maintaining maximum security."
    },
    {
      title: "Real-time Monitoring",
      content: "Your deployed contracts will include built-in monitoring and analytics capabilities."
    }
  ];

  // Deployment phases with detailed descriptions
  const deploymentPhases = [
    {
      id: 'checking',
      title: 'Verifying Deployment',
      description: 'Checking if contracts are already deployed for your wallet',
      duration: 10
    },
    {
      id: 'deploying',
      title: 'Deploying Contracts',
      description: 'Deploying smart contracts to Ethereum and Hedera networks',
      duration: 230
    },
    {
      id: 'completed',
      title: 'Deployment Complete',
      description: 'Contracts deployed successfully! Redirecting to playground...',
      duration: 5
    }
  ];

  // Progress tracking and tips rotation
  useEffect(() => {
    if (!isDeploying) return;

    const startTime = Date.now();
    const totalDuration = deploymentPhases.reduce((sum, phase) => sum + phase.duration, 0) * 1000; // Convert to milliseconds

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setDeploymentProgress(progress);
      
      const remaining = Math.max(0, (totalDuration - elapsed) / 1000);
      setEstimatedTimeRemaining(Math.ceil(remaining));
    }, 1000);

    const tipsInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % deploymentTips.length);
    }, 8000); // Change tip every 8 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipsInterval);
    };
  }, [isDeploying]);

  // Reset progress when deployment starts
  useEffect(() => {
    if (isDeploying) {
      setDeploymentProgress(0);
      setEstimatedTimeRemaining(240);
      setCurrentTip(0);
    }
  }, [isDeploying]);

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhase = () => {
    return deploymentPhases.find(phase => phase.id === deploymentPhase) || deploymentPhases[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Mock workflow creation
      console.log('Creating workflow:', inputValue);
      setInputValue('');
    }
  };

  const handleStartFromScratch = async () => {
    if (!isConnected) {
      if (!metaMaskConnector) {
        alert('MetaMask is not installed. Please install MetaMask to connect your wallet!');
        return;
      }
      connect({ connector: metaMaskConnector });
      return;
    }

    // If wallet is connected, proceed with deployment verification
    if (!address) {
      alert('Wallet address not available. Please try reconnecting your wallet.');
      return;
    }

    setIsDeploying(true);
    setDeploymentPhase('checking');
    setDeploymentError(null);
    setRetryCount(0);

    try {
      // First, check if deployment already exists
      const deploymentResponse = await apiService.getDeployment(address);
      
      if (deploymentResponse.success) {
        // Deployment exists, store addresses and navigate
        setDeploymentPhase('completed');
        setDeploymentAddresses(
          deploymentResponse.data.ethOappAddress,
          deploymentResponse.data.hederaOappAddress
        );
        setTimeout(() => navigate('/playground'), 100); // Small delay to show completion
        return;
      }

      // No deployment found or ethOappAddress is null/undefined, deploy new contract
      setDeploymentPhase('deploying');
      const deployResponse = await apiService.deployContract(address);
      
      if (deployResponse.success) {
        // Store the new deployment addresses
        setDeploymentPhase('completed');
        setDeploymentAddresses(
          deployResponse.data.ethOappAddress,
          deployResponse.data.hederaOappAddress
        );
        setTimeout(() => navigate('/playground'), 100); // Small delay to show completion
      } else {
        throw new Error(deployResponse.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentError({
        message: error.message,
        canRetry: retryCount < 3,
        retryCount: retryCount + 1
      });
      setRetryCount(prev => prev + 1);
    } finally {
      if (!deploymentError) {
        setIsDeploying(false);
        setDeploymentPhase('');
      }
    }
  };

  const handleRetryDeployment = async () => {
    setDeploymentError(null);
    await handleStartFromScratch();
  };

  const handleCancelDeployment = () => {
    setIsDeploying(false);
    setDeploymentPhase('');
    setDeploymentError(null);
    setRetryCount(0);
    setDeploymentProgress(0);
    setEstimatedTimeRemaining(240);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = "w-4 h-4" }) => (
    <motion.div
      className={`${size} border-2 border-gray-300 border-t-blue-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  // Get button text based on state
  const getButtonText = () => {
    if (isPending) return 'Connecting…';
    if (isDeploying) {
      switch (deploymentPhase) {
        case 'checking': return 'Checking deployment…';
        case 'deploying': return 'Deploying contract…';
        case 'completed': return 'Redirecting…';
        default: return 'Processing…';
      }
    }
    if (isConnected) return 'Open Playground';
    return 'Start from scratch (Connect Wallet)';
  };

  return (
    <section className="relative py-1 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
        >
          {/* Build Workflow Section */}
          <motion.div
            className="max-w-4xl mx-auto"
            variants={itemVariants}
          >
            <motion.div
              className="relative mb-6"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className={`bg-white/70 backdrop-blur-lg border-2 rounded-xl p-4 shadow-sm transition-all duration-300 ${
                  isFocused 
                    ? 'border-gray-400/50' 
                    : 'border-gray-200/50 hover:border-gray-300/50'
                }`}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Describe your workflows... (e.g., 'When a new NFT is minted, automatically send it to a specific wallet and notify me on Discord')"
                    className="w-full h-34 resize-none bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-base leading-relaxed"
                  />
                  
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    

                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-transparent border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!inputValue.trim()}
                    >
                      <span>Build Workflow</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                    or
                    <motion.button
                      type="button"
                      onClick={handleStartFromScratch}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                        isDeploying || isPending
                          ? 'bg-blue-50 border border-blue-200 text-blue-700 cursor-not-allowed'
                          : 'bg-transparent border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      whileHover={!isDeploying && !isPending ? { scale: 1.02 } : {}}
                      whileTap={!isDeploying && !isPending ? { scale: 0.98 } : {}}
                      disabled={isPending || isDeploying}
                    >
                      {(isDeploying || isPending) && <LoadingSpinner size="w-4 h-4" />}
                      <span>{getButtonText()}</span>
                      {!isDeploying && !isPending && isConnected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Example Workflows */}
            <motion.div className="text-center">
              <p className="text-gray-600 mb-4 text-sm">Try these popular Web3 workflows:</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'Monitor DeFi yields',
                  'Auto-buy on NFT drops',
                  'Cross-chain bridging',
                  'Liquidity management'
                ].map((example, index) => (
                  <motion.button
                    key={example}
                    onClick={() => setInputValue(example)}
                    className="px-3 py-2 bg-transparent border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-xs"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Minimalistic Deployment Progress Modal */}
            {isDeploying && (
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg max-w-md w-full"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getCurrentPhase().title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getCurrentPhase().description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-gray-600">
                        {Math.round(deploymentProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gray-900 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${deploymentProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {formatTime(estimatedTimeRemaining)} remaining
                    </div>
                  </div>

                  {/* Phase Steps */}
                  <div className="mb-6">
                    <div className="space-y-3">
                      {deploymentPhases.map((phase, index) => {
                        const isActive = deploymentPhase === phase.id;
                        const isCompleted = 
                          (phase.id === 'checking' && (deploymentPhase === 'deploying' || deploymentPhase === 'completed')) ||
                          (phase.id === 'deploying' && deploymentPhase === 'completed');
                        
                        return (
                          <div
                            key={phase.id}
                            className={`flex items-center space-x-3 py-2 transition-all duration-300 ${
                              isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                              isActive 
                                ? 'bg-gray-900 text-white' 
                                : isCompleted 
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-300 text-gray-500'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                isActive ? 'text-gray-900' : 'text-gray-600'
                              }`}>
                                {phase.title}
                              </h4>
                            </div>
                            {isActive && (
                              <div className="w-4 h-4">
                                <LoadingSpinner size="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Educational Tips */}
                  <div className="border-t border-gray-100 pt-4">
                    <motion.div
                      key={currentTip}
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        {deploymentTips[currentTip].title}
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {deploymentTips[currentTip].content}
                      </p>
                    </motion.div>
                    
                    {/* Tips Progress */}
                    <div className="flex justify-center mt-3 space-x-1">
                      {deploymentTips.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1 h-1 rounded-full transition-all duration-300 ${
                            index === currentTip ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Error Handling */}
                  {deploymentError && (
                    <motion.div
                      className="border-t border-gray-100 pt-4 mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          Deployment Failed
                        </div>
                        <p className="text-xs text-gray-600 mb-4">
                          {deploymentError.message}
                        </p>
                        <div className="flex justify-center space-x-2">
                          {deploymentError.canRetry && (
                            <motion.button
                              onClick={handleRetryDeployment}
                              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Retry
                            </motion.button>
                          )}
                          <motion.button
                            onClick={handleCancelDeployment}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                      Please don't close this window
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowBuilder;
