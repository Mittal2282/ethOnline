import { Handle, Position } from 'reactflow';
import { useState } from 'react';

const SwappingNode = ({ data, isConnectable }) => {
  const [swapDirection, setSwapDirection] = useState(data?.swapDirection ?? 'ethToHbar');
  const [value, setValue] = useState(data?.value ?? '');
  const [destinationWallet, setDestinationWallet] = useState(data?.destinationWallet ?? '');

  const executionState = data?.executionState || 'idle';
  
  // Debug logging
  console.log(`SwappingNode ${data?.id} execution state:`, executionState);

  const handleSwapDirectionToggle = () => {
    const newDirection = swapDirection === 'ethToHbar' ? 'hbarToEth' : 'ethToHbar';
    setSwapDirection(newDirection);
    // Update the data in the parent component
    if (data?.onUpdate) {
      data.onUpdate({ swapDirection: newDirection, value, destinationWallet });
    }
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data?.onUpdate) {
      data.onUpdate({ swapDirection, value: newValue, destinationWallet });
    }
  };

  const handleDestinationWalletChange = (e) => {
    const newWallet = e.target.value;
    setDestinationWallet(newWallet);
    if (data?.onUpdate) {
      data.onUpdate({ swapDirection, value, destinationWallet: newWallet });
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
        return 'bg-white border-amber-200';
    }
  };

  const isEthToHbar = swapDirection === 'ethToHbar';

  return (
    <div
      className={`group relative ${getNodeStyling()} rounded-lg shadow-sm min-w-[280px] hover:shadow-md transition-all duration-200`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: '#F59E0B',
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
              Swap Node {data?.nodeNumber ? `#${data.nodeNumber}` : ''}
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
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                Swap
              </span>
            </div>
          </div>

          {/* Swap Direction Display */}
          <div className="flex items-center justify-center gap-3 py-2">
            <span className={`text-sm font-semibold ${isEthToHbar ? 'text-blue-600' : 'text-gray-400'}`}>
              {isEthToHbar ? 'ETH' : 'HBAR'}
            </span>
            
            {/* Swap Direction Toggle Icon */}
            <button
              onClick={handleSwapDirectionToggle}
              className="p-1.5 hover:bg-gray-50 rounded-full border border-gray-300 hover:border-amber-500 transition-all duration-200 hover:scale-110 active:scale-95"
              title="Reverse swap direction"
            >
              <svg className="w-4 h-4 text-gray-600 hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            <span className={`text-sm font-semibold ${isEthToHbar ? 'text-gray-400' : 'text-purple-600'}`}>
              {isEthToHbar ? 'HBAR' : 'ETH'}
            </span>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount to Swap
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={value}
              onChange={handleValueChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Swap {value || '0'} {isEthToHbar ? 'ETH to HBAR' : 'HBAR to ETH'}
            </p>
          </div>

          {/* Destination Wallet Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Destination Wallet ({isEthToHbar ? 'HBAR' : 'ETH'})
            </label>
            <input
              type="text"
              placeholder={`Enter ${isEthToHbar ? 'HBAR' : 'ETH'} wallet address...`}
              value={destinationWallet}
              onChange={handleDestinationWalletChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Address to receive {isEthToHbar ? 'HBAR' : 'ETH'}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${value && destinationWallet ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-400">
                {value && destinationWallet ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <div className="text-xs text-amber-600 font-medium">
              {isEthToHbar ? 'ETH → HBAR' : 'HBAR → ETH'}
            </div>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: '#F59E0B',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default SwappingNode;

