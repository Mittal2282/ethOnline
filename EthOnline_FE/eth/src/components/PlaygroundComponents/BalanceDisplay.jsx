import React from 'react';
import { motion } from 'framer-motion';

const BalanceDisplay = ({ 
  ethUserBalance, 
  hederaUserBalance, 
  ethBridgeBalance, 
  hederaBridgeBalance, 
  isLoadingBalances, 
  onRefresh 
}) => {
  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  return (
    <div className="relative group">
      <motion.button
        onClick={onRefresh}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md hover:shadow-md transition-all duration-200"
        {...motionProps}
        title="Click to refresh balances"
      >
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-gray-900">{parseFloat(ethUserBalance).toFixed(4)} ETH</span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold text-gray-900">{parseFloat(hederaUserBalance).toFixed(4)} HBAR</span>
        </div>
        {isLoadingBalances && (
          <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </motion.button>

      {/* Hover Tooltip with Full Details */}
      <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">Contract Balances</div>
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-1">Ethereum</div>
            <div className="space-y-0.5">
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
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-1">Hedera</div>
            <div className="space-y-0.5">
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
        <div className="text-xs text-gray-500 mt-2 text-center">Click to refresh</div>
      </div>
    </div>
  );
};

export default BalanceDisplay;
