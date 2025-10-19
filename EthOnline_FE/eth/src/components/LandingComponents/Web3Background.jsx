/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const Web3Background = () => {

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Clean White Background - Zapier Style */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Subtle Geometric Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(45deg, #FF4A00 25%, transparent 25%), linear-gradient(-45deg, #FF4A00 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #FF4A00 75%), linear-gradient(-45deg, transparent 75%, #FF4A00 75%)`,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
        }}
      />

      {/* Minimal Accent Blobs - Zapier Colors */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-[#FF4A00]/5 to-[#FD7622]/5 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-gradient-to-br from-[#13D0AB]/8 to-[#499DF3]/8 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Subtle Connection Lines - Zapier Style */}
      <svg className="absolute inset-0 w-full h-full">
        <motion.line
          x1="15%"
          y1="25%"
          x2="85%"
          y2="75%"
          stroke="#FF4A00"
          strokeWidth="1"
          strokeOpacity="0.08"
          fill="none"
          animate={{
            pathLength: [0, 1],
            opacity: [0, 0.08, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.line
          x1="25%"
          y1="75%"
          x2="75%"
          y2="25%"
          stroke="#13D0AB"
          strokeWidth="1"
          strokeOpacity="0.06"
          fill="none"
          animate={{
            pathLength: [0, 1],
            opacity: [0, 0.06, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </svg>

      {/* Minimal Floating Elements */}
      <motion.div
        className="absolute top-1/5 right-1/6 w-3 h-3 bg-[#FF4A00] rounded-full"
        animate={{
          y: [-10, 10, -10],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/5 w-2 h-2 bg-[#13D0AB] rounded-full"
        animate={{
          y: [10, -10, 10],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />

      <motion.div
        className="absolute top-2/3 left-1/6 w-2 h-2 bg-[#499DF3] rounded-full"
        animate={{
          y: [-8, 8, -8],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
    </div>
  );
};

export default Web3Background;
