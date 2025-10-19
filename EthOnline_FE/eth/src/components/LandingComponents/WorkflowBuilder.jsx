/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';

const WorkflowBuilder = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();

  const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Mock workflow creation
      console.log('Creating workflow:', inputValue);
      setInputValue('');
    }
  };

  const handleStartFromScratch = () => {
    if (isConnected) {
      navigate('/playground');
      return;
    }

    if (!metaMaskConnector) {
      alert('MetaMask is not installed. Please install MetaMask to connect your wallet!');
      return;
    }

    connect({ connector: metaMaskConnector });
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
                      className="bg-transparent border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isPending}
                    >
                      {isConnected ? 'Open Playground' : (isPending ? 'Connecting…' : 'Start from scratch (Connect Wallet)')}
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

            
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowBuilder;
