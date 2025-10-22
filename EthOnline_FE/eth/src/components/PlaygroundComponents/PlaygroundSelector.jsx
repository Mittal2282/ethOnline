import React, { useState } from 'react';
import { usePlayground } from '../../hooks/usePlayground';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { contractService } from '../../services/contractService';
import { blockchainService } from '../../services/blockchainService';
import { workflowAPIService } from '../../services/workflowAPIService';

const PlaygroundSelector = () => {
  const {
    playgrounds,
    activePlayground,
    activePlaygroundId,
    setActivePlaygroundId,
    createPlayground,
    deletePlayground,
    renamePlayground,
    ethOappAddress,
    hederaOappAddress
  } = usePlayground();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaygroundName, setNewPlaygroundName] = useState('');
  const [editingPlayground, setEditingPlayground] = useState(null);
  const [editingName, setEditingName] = useState('');
  
  // Funding states
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [hederaAmount, setHederaAmount] = useState('');
  const [isProcessingEth, setIsProcessingEth] = useState(false);
  const [isProcessingHedera, setIsProcessingHedera] = useState(false);
  const [ethError, setEthError] = useState('');
  const [hederaError, setHederaError] = useState('');
  
  // Workflow execution states
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [executionProgress, setExecutionProgress] = useState({ current: 0, total: 0, step: '' });
  
  // Node creation states
  const [isNodeDropdownOpen, setIsNodeDropdownOpen] = useState(false);
  
  // Connect nodes states
  const [isConnectDropdownOpen, setIsConnectDropdownOpen] = useState(false);
  
  const { isConnected, chainId, address } = useAccount();
  const { writeContract: writeEthContract, isPending: isEthPending } = useWriteContract();
  const { writeContract: writeHederaContract, isPending: isHederaPending } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const handleCreatePlayground = () => {
    if (newPlaygroundName.trim()) {
      createPlayground(newPlaygroundName.trim());
      setNewPlaygroundName('');
      setIsCreating(false);
    }
  };

  const handleDeletePlayground = (playgroundId, e) => {
    e.stopPropagation();
    if (playgrounds.length > 1) {
      deletePlayground(playgroundId);
    }
  };

  const handleRenameStart = (playground, e) => {
    e.stopPropagation();
    setEditingPlayground(playground.id);
    setEditingName(playground.name);
  };

  const handleRenameSubmit = () => {
    if (editingName.trim() && editingPlayground) {
      renamePlayground(editingPlayground, editingName.trim());
      setEditingPlayground(null);
      setEditingName('');
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setEditingPlayground(null);
      setNewPlaygroundName('');
      setEditingName('');
    }
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
          const sourceNodeType = sourceNode.data?.isEth !== undefined ? 'Transaction Node' : 'Conditional Node';
          const targetNodeType = targetNode.data?.isEth !== undefined ? 'Transaction Node' : 'Conditional Node';
          
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

  // Funding functions
  const handleEthFunding = async () => {
    if (!ethAmount || !ethOappAddress || !isConnected) {
      setEthError('Please enter a valid amount and ensure wallet is connected');
      return;
    }

    setIsProcessingEth(true);
    setEthError('');

    try {
      // Switch to Sepolia if not already on it
      const sepoliaChainId = 11155111; // Sepolia chain ID
      if (chainId !== sepoliaChainId) {
        await switchChain({ chainId: sepoliaChainId });
      }

      const contractConfig = contractService.getContractConfig(ethOappAddress);
      const transactionData = contractService.prepareDepositTransaction(ethAmount);
      
      await writeEthContract({
        ...contractConfig,
        ...transactionData,
      });
      
      // Success - clear the input
      setEthAmount('');
      alert('ETH deposited successfully to contract!');
    } catch (error) {
      console.error('ETH deposit error:', error);
      setEthError(error.message || 'Failed to deposit ETH to contract');
    } finally {
      setIsProcessingEth(false);
    }
  };

  const handleHederaFunding = async () => {
    if (!hederaAmount || !hederaOappAddress) {
      setHederaError('Please enter a valid amount');
      return;
    }

    setIsProcessingHedera(true);
    setHederaError('');

    try {
      // Switch to Hedera testnet if not already on it
      const hederaChainId = 296; // Hedera testnet chain ID
      if (chainId !== hederaChainId) {
        await switchChain({ chainId: hederaChainId });
      }

      // Get Hedera contract config
      const contractConfig = contractService.getContractConfig(hederaOappAddress);
      const transactionData = contractService.prepareDepositTransaction(hederaAmount);
      
      await writeHederaContract({
        ...contractConfig,
        ...transactionData,
      });
      
      // Success - clear the input
      setHederaAmount('');
      alert('HBAR deposited successfully to contract!');
    } catch (error) {
      console.error('Hedera deposit error:', error);
      setHederaError(error.message || 'Failed to deposit HBAR to contract');
    } finally {
      setIsProcessingHedera(false);
    }
  };

  const resetFundingForm = () => {
    setEthAmount('');
    setHederaAmount('');
    setEthError('');
    setHederaError('');
    setIsProcessingEth(false);
    setIsProcessingHedera(false);
  };

  // Helper function to find the starting node (leftmost node)
  const findStartingNode = (nodes) => {
    return nodes.reduce((leftmost, node) => 
      node.position.x < leftmost.position.x ? node : leftmost
    );
  };

  // Helper function to build adjacency list from edges
  const buildGraph = (nodes, edges) => {
    const graph = new Map();
    nodes.forEach(node => {
      graph.set(node.id, { node, children: [] });
    });
    
    edges.forEach(edge => {
      const source = graph.get(edge.source);
      if (source) {
        source.children.push({
          target: edge.target,
          type: edge.data?.type || 'default'
        });
      }
    });
    
    return graph;
  };

  // Helper function to collect all nodes in execution order (including both branches)
  // The backend will handle the actual conditional execution
  const collectAllExecutableNodes = (graph, startNodeId) => {
    const executionPath = [];
    const visited = new Set();
    
    const traverse = (nodeId, pathSoFar = []) => {
      if (visited.has(nodeId)) {
        return; // Avoid cycles
      }
      
      const nodeInfo = graph.get(nodeId);
      if (!nodeInfo) {
        return;
      }
      
      visited.add(nodeId);
      const currentPath = [...pathSoFar, nodeId];
      
      // Add current node to execution path
      executionPath.push({
        nodeId,
        node: nodeInfo.node,
        path: [...currentPath]
      });
      
      // For conditional nodes, we need to include both branches in the payload
      // The backend will determine which branch to execute based on condition evaluation
      if (nodeInfo.node.type === 'conditionalNode' || nodeInfo.node.data?.currencyMode) {
        const trueEdge = nodeInfo.children.find(child => child.type === 'conditional-true');
        const falseEdge = nodeInfo.children.find(child => child.type === 'conditional-false');
        
        if (trueEdge) {
          traverse(trueEdge.target, currentPath);
        }
        if (falseEdge) {
          traverse(falseEdge.target, currentPath);
        }
      } else {
        // For regular nodes, follow the first available connection
        if (nodeInfo.children.length > 0) {
          traverse(nodeInfo.children[0].target, currentPath);
        }
      }
    };
    
    traverse(startNodeId);
    return executionPath;
  };

  // Workflow execution handler
  const handleExecuteWorkflow = async () => {
    if (!activePlayground?.nodes || activePlayground.nodes.length === 0) {
      alert('No nodes found in the workflow');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsExecutingWorkflow(true);
    setExecutionProgress({ current: 0, total: 0, step: 'Analyzing workflow...' });

    try {
      // Update blockchain service with current contract addresses
      blockchainService.updateContractAddresses(ethOappAddress, hederaOappAddress);

      // Build workflow graph
      const graph = buildGraph(activePlayground.nodes, activePlayground.edges);
      const startNode = findStartingNode(activePlayground.nodes);
      
      console.log('Workflow graph:', graph);
      console.log('Starting node:', startNode);

      // Collect all executable nodes (including both conditional branches)
      const executionPath = collectAllExecutableNodes(graph, startNode.id);
      
      console.log('Execution path:', executionPath);
      
      if (executionPath.length === 0) {
        throw new Error('No valid execution path found in workflow');
      }

      setExecutionProgress({ 
        current: 0, 
        total: executionPath.length, 
        step: 'Executing workflow...' 
      });

      const rules = [];
      const nodeToRuleId = new Map(); // Map node IDs to their rule IDs

      // Execute nodes in the traversal order
      for (let i = 0; i < executionPath.length; i++) {
        const pathItem = executionPath[i];
        const node = pathItem.node;
        const nodeData = node.data;
        
        console.log(`Processing node ${i + 1}/${executionPath.length}:`, {
          nodeId: node.id,
          type: node.type,
          data: nodeData
        });
        
        setExecutionProgress({ 
          current: i + 1, 
          total: executionPath.length, 
          step: `Executing ${node.type === 'conditionalNode' ? 'Conditional' : 'Transaction'} Node ${i + 1}...` 
        });
        
        let result;
        if (node.type === 'conditionalNode' || nodeData.currencyMode) {
          // Validate conditional node inputs
          if (!nodeData.currencyMode) {
            throw new Error(`Conditional node is missing currency mode`);
          }
          if (nodeData.currencyMode === 'single') {
            if (!nodeData.currencyA || !nodeData.operator || !nodeData.value) {
              throw new Error(`Conditional node is incomplete (currency/operator/value)`);
            }
          } else {
            if (!nodeData.currencyA || !nodeData.currencyB || !nodeData.operator || !nodeData.value) {
              throw new Error(`Ratio node is incomplete (currencyA/currencyB/operator/value)`);
            }
          }

          console.log('Calling createConditionalRule with:', {
            currencyMode: nodeData.currencyMode,
            operator: nodeData.operator,
            value: nodeData.value,
            currencyA: nodeData.currencyA,
            currencyB: nodeData.currencyB,
            userWalletAddress: address
          });

          result = await blockchainService.createConditionalRule({
            currencyMode: nodeData.currencyMode,
            operator: nodeData.operator,
            value: nodeData.value,
            currencyA: nodeData.currencyA,
            currencyB: nodeData.currencyB,
          }, address);
        } else {
          // Transaction node - validate required fields
          if (!nodeData.value || !nodeData.walletAddress) {
            throw new Error(`Transaction node is missing required data (amount or wallet address)`);
          }

          console.log('Calling createNativeRule with:', {
            isEth: nodeData.isEth,
            value: nodeData.value,
            walletAddress: nodeData.walletAddress
          });

          result = await blockchainService.createNativeRule({
            isEth: nodeData.isEth,
            value: nodeData.value,
            walletAddress: nodeData.walletAddress
          });
        }

        if (!result.success) {
          console.error(`Failed to process node:`, result);
          throw new Error(`Failed to process node: ${result.error}`);
        }

        // Store the rule ID for this node
        const currentRuleId = result.ruleId;
        nodeToRuleId.set(node.id, currentRuleId);

        // Determine if this is a conditional node and find true/false connections
        let isConditionalBranching = 0;
        let trueRuleId = null;
        let falseRuleId = null;

        if (node.type === 'conditionalNode' || nodeData.currencyMode) {
          isConditionalBranching = 1;
          
          // Find edges connected to this conditional node
          const connectedEdges = activePlayground.edges.filter(edge => 
            edge.source === node.id
          );

          // Find true and false target nodes in the execution path
          for (const edge of connectedEdges) {
            const targetNodeId = edge.target;
            const targetRuleId = nodeToRuleId.get(targetNodeId);
            
            if (targetRuleId !== undefined) {
              if (edge.data?.type === 'conditional-true') {
                trueRuleId = targetRuleId;
              } else if (edge.data?.type === 'conditional-false') {
                falseRuleId = targetRuleId;
              }
            }
          }
        }

        // Create rule object for API
        rules.push({
          rule_id: currentRuleId,
          operation: "cross chain",
          oapp_address: (node.type === 'conditionalNode' || nodeData.currencyMode) ? ethOappAddress : (nodeData.isEth ? ethOappAddress : hederaOappAddress),
          chain: (node.type === 'conditionalNode' || nodeData.currencyMode) ? "eth" : (nodeData.isEth ? "eth" : "hbar"),
          is_condition_branching: isConditionalBranching,
          next_id: null, // Will be set later
          is_true: trueRuleId,
          is_false: falseRuleId,
          is_terminated: 0 // Will be set later
        });

        // Small delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Link rules and set termination flags based on workflow structure
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        
        // For conditional nodes, set next_id to null and let is_true/is_false handle branching
        if (rule.is_condition_branching === 1) {
          rule.next_id = null; // Conditional nodes don't have sequential next
        } else {
          // For regular nodes, check if they're terminal (no outgoing edges)
          const currentNode = executionPath[i];
          const hasOutgoingEdges = activePlayground.edges.some(edge => edge.source === currentNode.nodeId);
          
          if (hasOutgoingEdges) {
            // This node has outgoing edges, find the next node in execution order
            const nextNodeIndex = i + 1;
            if (nextNodeIndex < rules.length) {
              rule.next_id = rules[nextNodeIndex].rule_id;
            } else {
              rule.next_id = null;
            }
          } else {
            // This node has no outgoing edges, it's terminal
            rule.next_id = null;
          }
        }
        
        // Set termination flag
        rule.is_terminated = rule.next_id === null ? 1 : 0;
      }

      setExecutionProgress({ 
        current: executionPath.length, 
        total: executionPath.length, 
        step: 'Submitting workflow to API...' 
      });

      // Prepare API payload
      const apiPayload = {
        rules: rules,
        starting_point: rules.length > 0 ? rules[0].rule_id : 0,
        userAddress: address
      };

      // Debug: verify payload before sending
      console.log('Submitting workflow payload:', apiPayload);

      // Make API call
      const apiResult = await workflowAPIService.executeRules(apiPayload);

      if (apiResult.success) {
        alert(`✅ Workflow executed successfully!\n${executionPath.length} nodes processed and submitted.`);
      } else {
        throw new Error(`API call failed: ${apiResult.error}`);
      }

    } catch (error) {
      console.error('Workflow execution error:', error);
      alert(`❌ Workflow execution failed: ${error.message}`);
    } finally {
      setIsExecutingWorkflow(false);
      setExecutionProgress({ current: 0, total: 0, step: '' });
    }
  };


 
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
      {/* Playground Selector Button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
            <span className="font-medium text-gray-900 truncate max-w-[160px] text-sm">
              {activePlayground?.name || 'Select Playground'}
            </span>
          </div>
          <motion.svg
            className="w-3.5 h-3.5 text-gray-500"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
            >
              <div className="p-2">
                {/* Playground List */}
                <div className="space-y-0.5">
                  {playgrounds.map((playground) => (
                    <div
                      key={playground.id}
                      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        playground.id === activePlaygroundId
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setActivePlaygroundId(playground.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                          playground.id === activePlaygroundId ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}></div>
                        {editingPlayground === playground.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={(e) => handleKeyPress(e, handleRenameSubmit)}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-900 truncate text-sm">
                            {playground.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {playground.nodes.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          onClick={(e) => handleRenameStart(playground, e)}
                          className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        {playgrounds.length > 1 && (
                          <motion.button
                            onClick={(e) => handleDeletePlayground(playground.id, e)}
                            className="p-1 hover:bg-red-100 rounded-md transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      
     

      {/* Add New Playground Button - Outside Dropdown */}
      <motion.button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Playground
      </motion.button>
      {/* Connect Nodes Dropdown */}
      {activePlayground?.nodes && activePlayground.nodes.length >= 2 && getConnectionOptions().length > 0 && (
        <div className="relative">
          <motion.button
            onClick={() => setIsConnectDropdownOpen(!isConnectDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="space-y-1">
                    {getConnectionOptions().map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleConnectNodes(option)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
            >
              <div className="p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => handleAddNode('transaction')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Transaction Node
                  </button>
                  <button
                    onClick={() => handleAddNode('conditional')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Conditional Node
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Funds Button */}
      {isConnected && ethOappAddress && hederaOappAddress && (
        <motion.button
          onClick={() => setIsFundingOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Add Funds
        </motion.button>
      )}
      </div>

      {/* Execute Workflow Button - Right aligned */}
      <motion.button
        onClick={handleExecuteWorkflow}
        disabled={!activePlayground?.nodes?.length || isExecutingWorkflow || !isConnected}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
          !activePlayground?.nodes?.length || isExecutingWorkflow || !isConnected
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
        whileHover={!isExecutingWorkflow && activePlayground?.nodes?.length && isConnected ? { scale: 1.02 } : {}}
        whileTap={!isExecutingWorkflow && activePlayground?.nodes?.length && isConnected ? { scale: 0.98 } : {}}
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
     

      {/* Create Playground Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-4 w-80 shadow-2xl"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-3">Create New Playground</h3>
            <input
              type="text"
              value={newPlaygroundName}
              onChange={(e) => setNewPlaygroundName(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleCreatePlayground)}
              placeholder="Enter playground name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-3 text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <motion.button
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaygroundName('');
                }}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreatePlayground}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors duration-200 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Execution Progress Modal */}
      {isExecutingWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-96 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Executing Workflow</h3>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(executionProgress.current / executionProgress.total) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Progress Text */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {executionProgress.step}
                </p>
                <p className="text-xs text-gray-500">
                  {executionProgress.current} of {executionProgress.total} transactions
                </p>
              </div>

              {/* Detailed Progress */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Signing transactions sequentially</p>
                  <p>• Creating blockchain rules</p>
                  <p>• Submitting to workflow API</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Funding Modal */}
      {isFundingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-96 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Deposit Funds to Contracts</h3>
              <motion.button
                onClick={() => {
                  setIsFundingOpen(false);
                  resetFundingForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Ethereum Funding */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ethereum (ETH)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={ethAmount}
                      onChange={(e) => {
                        setEthAmount(e.target.value);
                        setEthError('');
                      }}
                      placeholder="0.0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        ethError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isProcessingEth || isEthPending}
                    />
                    {ethError && (
                      <p className="text-xs text-red-600 mt-1">{ethError}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleEthFunding}
                    disabled={!ethAmount || isProcessingEth || isEthPending}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                      !ethAmount || isProcessingEth || isEthPending
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    whileHover={!isProcessingEth && !isEthPending && ethAmount ? { scale: 1.02 } : {}}
                    whileTap={!isProcessingEth && !isEthPending && ethAmount ? { scale: 0.98 } : {}}
                  >
                    {isProcessingEth || isEthPending ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Depositing...
                      </div>
                    ) : (
                      'Deposit ETH'
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500">
                  To: {ethOappAddress ? `${ethOappAddress.slice(0, 6)}...${ethOappAddress.slice(-4)}` : 'Not available'}
                </p>
              </div>

              {/* Hedera Funding */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hedera (HBAR)
                </label>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={hederaAmount}
                      onChange={(e) => {
                        setHederaAmount(e.target.value);
                        setHederaError('');
                      }}
                      placeholder="0.0"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                        hederaError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isProcessingHedera}
                    />
                    {hederaError && (
                      <p className="text-xs text-red-600 mt-1">{hederaError}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleHederaFunding}
                    disabled={!hederaAmount || isProcessingHedera || isHederaPending}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                      !hederaAmount || isProcessingHedera || isHederaPending
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    whileHover={!isProcessingHedera && !isHederaPending && hederaAmount ? { scale: 1.02 } : {}}
                    whileTap={!isProcessingHedera && !isHederaPending && hederaAmount ? { scale: 0.98 } : {}}
                  >
                    {isProcessingHedera || isHederaPending ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Depositing...
                      </div>
                    ) : (
                      'Deposit HBAR'
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500">
                  To: {hederaOappAddress ? `${hederaOappAddress.slice(0, 6)}...${hederaOappAddress.slice(-4)}` : 'Not available'}
                </p>
                <p className="text-xs text-blue-600">
                  ℹ️ Wallet will prompt to switch to Hedera Testnet for this transaction
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => {
                    setIsFundingOpen(false);
                    resetFundingForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundSelector;
