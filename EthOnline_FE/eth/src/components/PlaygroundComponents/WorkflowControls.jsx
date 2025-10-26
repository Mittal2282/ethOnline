import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkflowControls = ({ 
  activePlayground, 
  isConnected, 
  isExecutingWorkflow, 
  onExecuteWorkflow 
}) => {
  const [isNodeDropdownOpen, setIsNodeDropdownOpen] = useState(false);
  const [isConnectDropdownOpen, setIsConnectDropdownOpen] = useState(false);

  const buttonStyles = {
    primary: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium text-sm transition-all duration-200",
    dropdown: "w-full px-3 py-2 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-150 flex items-center gap-2",
    disabled: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-500 cursor-not-allowed rounded-full font-medium text-sm transition-all duration-200"
  };

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  const handleAddNode = (nodeType) => {
    setIsNodeDropdownOpen(false);
    
    // Call the global function to add the node
    if (window.addNode) {
      window.addNode(nodeType);
    }
  };

  // Get available connection options
  const getConnectionOptions = () => {
    if (!activePlayground?.nodes || activePlayground.nodes.length < 2) {
      return [];
    }

    const nodes = activePlayground.nodes;
    const edges = activePlayground.edges || [];
    const options = [];

    // Sort nodes by x position for logical ordering
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

    // Generate connection options
    for (let i = 0; i < sortedNodes.length; i++) {
      for (let j = i + 1; j < sortedNodes.length; j++) {
        const sourceNode = sortedNodes[i];
        const targetNode = sortedNodes[j];
        
        // Check if these nodes are already connected
        const alreadyConnected = edges.some(edge => 
          (edge.source === sourceNode.id && edge.target === targetNode.id) ||
          (edge.source === targetNode.id && edge.target === sourceNode.id)
        );

        if (!alreadyConnected) {
          const sourceNodeNumber = sourceNode.data?.nodeNumber || (i + 1);
          const targetNodeNumber = targetNode.data?.nodeNumber || (j + 1);
          
          // Determine node type
          let sourceNodeType, targetNodeType;
          
          if (sourceNode.type === 'swappingNode' || sourceNode.data?.swapDirection) {
            sourceNodeType = 'Swap Node';
          } else if (sourceNode.type === 'conditionalNode' || sourceNode.data?.currencyMode) {
            sourceNodeType = 'Conditional Node';
          } else {
            sourceNodeType = 'Transaction Node';
          }
          
          if (targetNode.type === 'swappingNode' || targetNode.data?.swapDirection) {
            targetNodeType = 'Swap Node';
          } else if (targetNode.type === 'conditionalNode' || targetNode.data?.currencyMode) {
            targetNodeType = 'Conditional Node';
          } else {
            targetNodeType = 'Transaction Node';
          }
          
          options.push({
            id: `${sourceNode.id}-${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            sourceName: `${sourceNodeType} ${sourceNodeNumber}`,
            targetName: `${targetNodeType} ${targetNodeNumber}`,
            label: `Connect ${sourceNodeType} ${sourceNodeNumber} and ${targetNodeType} ${targetNodeNumber}`
          });
        }
      }
    }

    return options;
  };

  const handleConnectNodes = (option) => {
    setIsConnectDropdownOpen(false);
    
    // Call the global function to connect specific nodes
    if (window.connectSpecificNodes) {
      window.connectSpecificNodes(option.sourceId, option.targetId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connect Nodes Dropdown */}
      {activePlayground?.nodes && activePlayground.nodes.length >= 2 && getConnectionOptions().length > 0 && (
        <div className="relative">
          <motion.button
            onClick={() => setIsConnectDropdownOpen(!isConnectDropdownOpen)}
            className={buttonStyles.primary}
            {...motionProps}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Nodes
            <motion.svg
              className="w-3 h-3"
              animate={{ rotate: isConnectDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>

          {/* Connection Options Dropdown */}
          <AnimatePresence>
            {isConnectDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                <div className="p-1">
                  <div className="space-y-0.5">
                    {getConnectionOptions().map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleConnectNodes(option)}
                        className={buttonStyles.dropdown}
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Node Dropdown */}
      <div className="relative">
        <motion.button
          onClick={() => setIsNodeDropdownOpen(!isNodeDropdownOpen)}
          className={buttonStyles.primary}
          {...motionProps}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Node
          <motion.svg
            className="w-3 h-3"
            animate={{ rotate: isNodeDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        {/* Node Type Dropdown */}
        <AnimatePresence>
          {isNodeDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50"
            >
              <div className="p-1">
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleAddNode('transaction')}
                    className={buttonStyles.dropdown}
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Transaction
                  </button>
                  <button
                    onClick={() => handleAddNode('conditional')}
                    className={buttonStyles.dropdown}
                  >
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                    Conditional
                  </button>
                  <button
                    onClick={() => handleAddNode('swap')}
                    className={buttonStyles.dropdown}
                  >
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    Bridge
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Execute Workflow Button */}
      <motion.button
        onClick={onExecuteWorkflow}
        disabled={!activePlayground?.nodes?.length || isExecutingWorkflow || !isConnected}
        className={
          !activePlayground?.nodes?.length || isExecutingWorkflow || !isConnected
            ? buttonStyles.disabled
            : buttonStyles.primary
        }
        {...motionProps}
        title={
          !isConnected ? 'Connect wallet first' :
          !activePlayground?.nodes?.length ? 'Add nodes to workflow' :
          isExecutingWorkflow ? 'Executing workflow...' : ''
        }
      >
        {isExecutingWorkflow ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Executing...
          </div>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Execute Workflow
          </>
        )}
      </motion.button>
    </div>
  );
};

export default WorkflowControls;
