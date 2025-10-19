/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const Hero = () => {

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
    <section className="relative p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline with Web3 Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-medium mb-6 leading-tight"
            style={{ 
              fontFamily: '"Degular Display", Inter, sans-serif',
              color: '#201515'
            }}
            variants={itemVariants}
          >
            <span className="block">
              Go from concept to Web3-ready
            </span>
            <span className="block mt-2">
               dApps in seconds
            </span>
             
          </motion.h1>

          {/* Subtitle */}
        


        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-4 h-4 bg-blue-400/30 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-20 w-3 h-3 bg-purple-400/40 rounded-full"
        animate={{
          y: [0, -15, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </section>
  );
};

export default Hero;
