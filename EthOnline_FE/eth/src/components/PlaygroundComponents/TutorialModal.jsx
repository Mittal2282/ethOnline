import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TutorialModal = ({ isOpen, onClose, onStartFunding }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to the Playground",
      content: "Before creating workflows, you'll need to fund your smart contracts with ETH and HBAR tokens to enable cross-chain operations.",
      highlight: "funding"
    },
    {
      title: "Why Funding is Required",
      content: "Your workflows execute cross-chain transactions that require gas fees and bridge operations. Contract funding ensures smooth execution without interruptions.",
      highlight: "explanation"
    },
    {
      title: "Ready to Get Started?",
      content: "Click 'Add Funds' to deposit ETH and HBAR into your contracts, then you can build and execute workflows seamlessly.",
      highlight: "action"
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStartFunding();
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-lg font-medium">
                  {currentStep + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === currentStep 
                            ? 'bg-gray-900 w-8' 
                            : index < currentStep 
                              ? 'bg-gray-400 w-6' 
                              : 'bg-gray-200 w-6'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={handleSkip}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.content}
              </p>

              {/* Step-specific highlights */}
              {currentStepData.highlight === 'funding' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Setup</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Deposit small amounts (0.01 ETH, 1 HBAR) to get started with your first workflow</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStepData.highlight === 'explanation' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Smart Execution</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Funds are used for gas fees, bridge operations, and seamless transaction execution</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStepData.highlight === 'action' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Ready to Build</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Once funded, you can create complex cross-chain workflows with confidence</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={currentStep > 0 ? { scale: 1.02 } : {}}
                whileTap={currentStep > 0 ? { scale: 0.98 } : {}}
              >
                Previous
              </motion.button>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleSkip}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip Tutorial
                </motion.button>
                
                <motion.button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep === steps.length - 1 ? 'Start Funding' : 'Next'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TutorialModal;
