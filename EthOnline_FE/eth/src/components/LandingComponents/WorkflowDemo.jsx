import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useState } from 'react';

const WorkflowDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Mock workflow creation
      console.log('Creating workflow:', inputValue);
      setInputValue('');
    }
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          

          {/* Main Input Area */}
          <motion.div
            className="relative mb-8"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* Glassmorphism Container */}
              <motion.div
                className={`bg-white/70 backdrop-blur-lg border-2 rounded-2xl p-6 shadow-2xl transition-all duration-300 ${
                  isFocused 
                    ? 'border-blue-400/50 shadow-blue-400/20' 
                    : 'border-gray-200/50 hover:border-gray-300/50'
                }`}
                animate={{
                  boxShadow: isFocused 
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.25)' 
                    : '0 20px 40px -12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Describe your workflows... (e.g., 'When a new NFT is minted, automatically send it to a specific wallet and notify me on Discord')"
                    className="w-full h-32 resize-none bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-lg leading-relaxed"
                  />
                </form>

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 opacity-0"
                  animate={{ opacity: isFocused ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                    backgroundSize: '200% 200%'
                  }}
                />

                {/* CTA Button */}
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  className="absolute bottom-4 right-4 bg-transparent border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!inputValue.trim()}
                >
                  <span>Build Workflow</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: inputValue.trim() ? [0, 5, 0] : 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </motion.button>

                {/* Floating Icons */}
                <motion.div
                  className="absolute top-4 left-4 flex space-x-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">W3</span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </motion.div>
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-2xl blur-xl -z-10"
                animate={{
                  opacity: isFocused ? 0.8 : 0.4,
                  scale: isFocused ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={itemVariants}
          >
            {[
              {
                title: 'Smart Contract Integration',
                desc: 'Connect to any EVM-compatible blockchain'
              },
              {
                title: 'Real-time Triggers',
                desc: 'Respond instantly to on-chain events'
              },
              {
                title: 'Secure & Audited',
                desc: 'Enterprise-grade security for your workflows'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 text-center hover:bg-white/70 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="font-medium mb-2" style={{ color: '#201515' }}>{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Example Workflows */}
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-gray-600 mb-6">Try these popular Web3 workflows:</p>
            
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={itemVariants}
            >
              {[
                'Monitor DeFi yields',
                'Auto-buy on NFT drops',
                'Cross-chain bridging',
                'Liquidity management'
              ].map((example, index) => (
                <motion.button
                  key={example}
                  className="px-4 py-2 bg-transparent border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputValue(example)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {example}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkflowDemo;
