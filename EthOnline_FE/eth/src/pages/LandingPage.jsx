/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import Web3Background from '../components/LandingComponents/Web3Background';
import Navbar from '../components/LandingComponents/Navbar';
import Hero from '../components/LandingComponents/Hero';
import WorkflowBuilder from '../components/LandingComponents/WorkflowBuilder';
import SuggestedWorkflows from '../components/LandingComponents/SuggestedWorkflows';
import MeetTheTeam from '../components/LandingComponents/MeetTheTeam';
import Footer from '../components/LandingComponents/Footer';

const LandingPage = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    in: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    out: { 
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      {/* Web3 Background Effects */}
      <Web3Background />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <Navbar />
        
        {/* Hero Section */}
        <Hero />
        
        {/* Workflow Builder Section */}
        <WorkflowBuilder />
        
      
        
        {/* Suggested Workflows Section */}
        <SuggestedWorkflows />
        
        {/* Meet the Team Section */}
        <MeetTheTeam />
        
        {/* Footer */}
        <Footer />
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-transparent border border-gray-300 text-gray-700 rounded-full hover:border-gray-400 hover:bg-gray-50 z-40 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default LandingPage;
