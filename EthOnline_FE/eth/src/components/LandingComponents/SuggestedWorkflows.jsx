/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const SuggestedWorkflows = () => {
  const carouselItems = [
    // Row 1 - Moving left to right
    [
      'DeFi Yield Farming', 'NFT Marketplace', 'Token Swapping', 'Liquidity Provision',
      'Cross-chain Bridges', 'DAO Governance', 'Smart Contract Deployment', 'DeFi Yield Farming',
      'NFT Marketplace', 'Token Swapping', 'Liquidity Provision', 'Cross-chain Bridges'
    ],
    // Row 2 - Moving right to left  
    [
      'Wallet Integration', 'Multi-sig Management', 'Portfolio Tracking', 'Price Monitoring',
      'Transaction Batching', 'Gas Optimization', 'MEV Protection', 'Wallet Integration',
      'Multi-sig Management', 'Portfolio Tracking', 'Price Monitoring', 'Transaction Batching'
    ],
    // Row 3 - Moving left to right
    [
      'Staking Rewards', 'Validator Monitoring', 'Slashing Alerts', 'Reward Distribution',
      'Node Management', 'Network Health', 'Consensus Participation', 'Staking Rewards',
      'Validator Monitoring', 'Slashing Alerts', 'Reward Distribution', 'Node Management'
    ]
  ];

  const carouselVariants = {
    animate: (direction) => ({
      x: direction === 'right' ? ['-100%', '0%'] : ['0%', '-100%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        },
      },
    }),
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium mb-4" style={{ color: '#201515' }}>
            Popular Web3 Workflows
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover powerful blockchain automation workflows. From DeFi strategies to 
            validator management, streamline your Web3 operations with smart automation.
          </p>
        </div>

        {/* Carousel Rows */}
        <div className="space-y-8">
          {carouselItems.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {/* Smudged Edges */}
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              
              {/* Carousel Container */}
              <div className="flex overflow-hidden">
                <motion.div
                  className="flex space-x-4"
                  custom={rowIndex % 2 === 0 ? 'right' : 'left'}
                  variants={carouselVariants}
                  animate="animate"
                  style={{ width: 'max-content' }}
                >
                  {/* Duplicate items for seamless loop */}
                  {[...row, ...row].map((item, index) => (
                    <motion.div
                      key={`${rowIndex}-${index}`}
                      className="flex-shrink-0 bg-white text-gray-800 px-6 py-3 rounded-lg text-sm font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 cursor-pointer shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default SuggestedWorkflows;
