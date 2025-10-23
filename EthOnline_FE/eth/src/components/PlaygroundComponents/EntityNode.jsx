import { Handle, Position } from 'reactflow';
import { useState } from 'react';

const EntityNode = ({ data, isConnectable }) => {
  const [isEth, setIsEth] = useState(data?.isEth ?? true);
  const [value, setValue] = useState(data?.value ?? '');
  const [walletAddress, setWalletAddress] = useState(data?.walletAddress ?? '');

  const executionState = data?.executionState || 'idle';
  
  // Debug logging
  console.log(`EntityNode ${data?.id} execution state:`, executionState);

  const handleToggle = () => {
    const newIsEth = !isEth;
    setIsEth(newIsEth);
    // Update the data in the parent component
    if (data?.onUpdate) {
      data.onUpdate({ isEth: newIsEth, value, walletAddress });
    }
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data?.onUpdate) {
      data.onUpdate({ isEth, value: newValue, walletAddress });
    }
  };

  const handleWalletChange = (e) => {
    const newWalletAddress = e.target.value;
    setWalletAddress(newWalletAddress);
    if (data?.onUpdate) {
      data.onUpdate({ isEth, value, walletAddress: newWalletAddress });
    }
  };


  // Determine node styling based on execution state
  const getNodeStyling = () => {
    switch (executionState) {
      case 'loading':
        return 'bg-blue-50 border-blue-300 shadow-blue-100';
      case 'completed':
        return 'bg-green-50 border-green-300 shadow-green-100';
      case 'error':
        return 'bg-red-50 border-red-300 shadow-red-100';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div
      className={`group relative ${getNodeStyling()} rounded-lg shadow-sm min-w-[280px] hover:shadow-md transition-all duration-200`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: '#374151',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />

      {/* Delete Button - Top Right */}
      {data?.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full z-10"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              Transaction Node {data?.nodeNumber ? `#${data.nodeNumber}` : ''}
            </h3>
            <div className="flex items-center space-x-2">
              {executionState === 'loading' && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-blue-600 font-medium">Processing</span>
                </div>
              )}
              {executionState === 'completed' && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                </div>
              )}
              {executionState === 'error' && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-red-600 font-medium">Error</span>
                </div>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${isEth ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {isEth ? 'ETH' : 'Hedera'}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isEth ? 'bg-blue-600' : 'bg-purple-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-600">
              {isEth ? 'Ethereum' : 'Hedera'}
            </span>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={value}
              onChange={handleValueChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Wallet Address Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Destination Wallet
            </label>
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={walletAddress}
              onChange={handleWalletChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>


          {/* Status indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${value && walletAddress ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-400">
                {value && walletAddress ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {isEth ? 'ETH' : 'HBAR'}
            </div>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: '#374151',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default EntityNode;
