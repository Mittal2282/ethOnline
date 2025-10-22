/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { usePlayground } from '../../hooks/usePlayground';
import { apiService } from '../../services/api';

const WorkflowBuilder = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentPhase, setDeploymentPhase] = useState(''); // 'checking', 'deploying', 'completed'
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();
  const { setDeploymentAddresses } = usePlayground();

  const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');

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
      alert(`Failed to deploy contract: ${error.message}`);
    } finally {
      setIsDeploying(false);
      setDeploymentPhase('');
    }
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

            {/* Deployment Progress Indicator */}
            {isDeploying && (
              <motion.div
                className="mt-6 max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <LoadingSpinner size="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700">
                      {deploymentPhase === 'checking' && 'Checking existing deployment...'}
                      {deploymentPhase === 'deploying' && 'Deploying smart contracts...'}
                      {deploymentPhase === 'completed' && 'Deployment completed!'}
                    </span>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center space-x-2">
                    {['checking', 'deploying', 'completed'].map((phase, index) => (
                      <div key={phase} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          (deploymentPhase === phase) || 
                          (phase === 'checking' && deploymentPhase === 'deploying') ||
                          (phase === 'checking' && deploymentPhase === 'completed') ||
                          (phase === 'deploying' && deploymentPhase === 'completed')
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`} />
                        {index < 2 && (
                          <div className={`w-4 h-0.5 mx-1 transition-all duration-300 ${
                            (phase === 'checking' && deploymentPhase === 'deploying') ||
                            (phase === 'checking' && deploymentPhase === 'completed') ||
                            (phase === 'deploying' && deploymentPhase === 'completed')
                              ? 'bg-blue-500' 
                              : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {deploymentPhase === 'checking' && 'Verifying if contracts are already deployed...'}
                    {deploymentPhase === 'deploying' && 'This may take a few moments...'}
                    {deploymentPhase === 'completed' && 'Redirecting to playground...'}
                  </div>
                </div>
              </motion.div>
            )}

            
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowBuilder;
