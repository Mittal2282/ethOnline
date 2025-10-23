import { Handle, Position } from 'reactflow';
import { useState } from 'react';

const ConditionalNode = ({ data, isConnectable }) => {
  const [currencyMode, setCurrencyMode] = useState(data?.currencyMode ?? 'single');
  const [operator, setOperator] = useState(data?.operator ?? 'greater_than');
  const [value, setValue] = useState(data?.value ?? '');
  const [currencyA, setCurrencyA] = useState(data?.currencyA ?? 'ETH');
  const [currencyB, setCurrencyB] = useState(data?.currencyB ?? 'HBAR');

  const executionState = data?.executionState || 'idle';

  const handleCurrencyModeChange = (mode) => {
    setCurrencyMode(mode);
    if (data?.onUpdate) {
      data.onUpdate({ currencyMode: mode, operator, value, currencyA, currencyB });
    }
  };

  const handleOperatorChange = (e) => {
    const newOperator = e.target.value;
    setOperator(newOperator);
    if (data?.onUpdate) {
      data.onUpdate({ currencyMode, operator: newOperator, value, currencyA, currencyB });
    }
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data?.onUpdate) {
      data.onUpdate({ currencyMode, operator, value: newValue, currencyA, currencyB });
    }
  };

  const handleCurrencyAChange = (e) => {
    const newCurrencyA = e.target.value;
    setCurrencyA(newCurrencyA);
    if (data?.onUpdate) {
      data.onUpdate({ currencyMode, operator, value, currencyA: newCurrencyA, currencyB });
    }
  };

  const handleCurrencyBChange = (e) => {
    const newCurrencyB = e.target.value;
    setCurrencyB(newCurrencyB);
    if (data?.onUpdate) {
      data.onUpdate({ currencyMode, operator, value, currencyA, currencyB: newCurrencyB });
    }
  };

  const isComplete = () => {
    if (currencyMode === 'single') {
      return Boolean(operator && value && Number(value) > 0);
    } else if (currencyMode === 'ratio') {
      return Boolean(operator && currencyA && currencyB && currencyA !== currencyB);
    }
    return false;
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
        return 'bg-white border-indigo-200';
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
          background: '#6366F1',
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
              Conditional Node {data?.nodeNumber ? `#${data.nodeNumber}` : ''}
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
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                Condition
              </span>
            </div>
          </div>

          {/* Currency Mode Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Currency Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                  currencyMode === 'single' 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCurrencyModeChange('single')}
              >
                Single
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                  currencyMode === 'ratio' 
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCurrencyModeChange('ratio')}
              >
                Ratio
              </button>
            </div>
          </div>

          {/* Single Currency Mode */}
          {currencyMode === 'single' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={currencyA}
                  onChange={handleCurrencyAChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="HBAR">HBAR</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={handleOperatorChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto"
                  style={{ maxHeight: '200px' }}
                >
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="less_than">Less Than (&lt;)</option>
                  <option value="equal_to">Equal To (=)</option>
                  <option value="less_than_equal">Less Than or Equal (≤)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Value (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price value"
                  value={value}
                  onChange={handleValueChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Triggers when {currencyA} price is {operator.replace('_', ' ')} ${value || '0'}
                </p>
              </div>
            </div>
          )}

          {/* Ratio Currency Mode */}
          {currencyMode === 'ratio' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency A</label>
                <select
                  value={currencyA}
                  onChange={handleCurrencyAChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="HBAR">HBAR</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Currency B</label>
                <select
                  value={currencyB}
                  onChange={handleCurrencyBChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="HBAR">HBAR</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={handleOperatorChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto"
                  style={{ maxHeight: '200px' }}
                >
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="less_than">Less Than (&lt;)</option>
                  <option value="equal_to">Equal To (=)</option>
                  <option value="less_than_equal">Less Than or Equal (≤)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ratio Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  placeholder="Enter ratio value"
                  value={value}
                  onChange={handleValueChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Triggers when {currencyA}/{currencyB} ratio is {operator.replace('_', ' ')} {value || '0'}
                </p>
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isComplete() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-400">
                {isComplete() ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <div className="text-xs text-indigo-600 font-medium">
              CONDITION
            </div>
          </div>
        </div>
      </div>

      {/* Output Handles - True and False */}
      <Handle
        type="source"
        position={Position.Top}
        id="true"
        style={{ 
          background: '#10B981',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ 
          background: '#EF4444',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default ConditionalNode;
