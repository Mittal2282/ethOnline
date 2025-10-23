import React, { useState } from 'react';
import { usePlayground } from '../../hooks/usePlayground';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { ethers } from 'ethers';
import contractABI from '../../data/abi.json';
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
    hederaOappAddress,
    updateNodeExecutionState,
    clearNodeExecutionStates
  } = usePlayground();

  // Consistent button styling system - unified theme
  const buttonStyles = {
    primary: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md",
    secondary: "flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md",
    ghost: "px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm",
    dropdown: "w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center gap-2",
    icon: "p-1 hover:bg-gray-200 rounded-md transition-colors duration-200",
    iconDanger: "p-1 hover:bg-red-100 rounded-md transition-colors duration-200",
    disabled: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-300 text-gray-500 cursor-not-allowed rounded-md font-medium text-sm transition-all duration-200 shadow-sm"
  };

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaygroundName, setNewPlaygroundName] = useState('');
  const [editingPlayground, setEditingPlayground] = useState(null);
  const [editingName, setEditingName] = useState('');
  
  // Funding states
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [hederaAmount, setHederaAmount] = useState('');
  const [ethBridgeAmount, setEthBridgeAmount] = useState('');
  const [hederaBridgeAmount, setHederaBridgeAmount] = useState('');
  const [isProcessingEth, setIsProcessingEth] = useState(false);
  const [isProcessingHedera, setIsProcessingHedera] = useState(false);
  const [isProcessingEthBridge, setIsProcessingEthBridge] = useState(false);
  const [isProcessingHederaBridge, setIsProcessingHederaBridge] = useState(false);
  const [ethError, setEthError] = useState('');
  const [hederaError, setHederaError] = useState('');
  const [ethBridgeError, setEthBridgeError] = useState('');
  const [hederaBridgeError, setHederaBridgeError] = useState('');
  
  // Workflow execution states
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  
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

  // Bridge funding handlers
  const handleEthBridgeFunding = async () => {
    if (!ethBridgeAmount || !ethOappAddress || !isConnected) {
      setEthBridgeError('Please enter a valid amount and ensure wallet is connected');
      return;
    }

    setIsProcessingEthBridge(true);
    setEthBridgeError('');

    try {
      // Switch to Sepolia if not already on it
      const sepoliaChainId = 11155111; // Sepolia chain ID
      if (chainId !== sepoliaChainId) {
        await switchChain({ chainId: sepoliaChainId });
      }

      const contractConfig = {
        address: ethOappAddress,
        abi: contractABI,
        functionName: 'depositProtocolFunds',
        value: ethers.parseEther(ethBridgeAmount),
        gasLimit: 100000
      };
      
      await writeEthContract(contractConfig);
      
      // Success - clear the input
      setEthBridgeAmount('');
      alert('ETH bridge funds deposited successfully!');
    } catch (error) {
      console.error('ETH bridge deposit error:', error);
      setEthBridgeError(error.message || 'Failed to deposit ETH bridge funds');
    } finally {
      setIsProcessingEthBridge(false);
    }
  };

  const handleHederaBridgeFunding = async () => {
    if (!hederaBridgeAmount || !hederaOappAddress) {
      setHederaBridgeError('Please enter a valid amount');
      return;
    }

    setIsProcessingHederaBridge(true);
    setHederaBridgeError('');

    try {
      // Switch to Hedera testnet if not already on it
      const hederaChainId = 296; // Hedera testnet chain ID
      if (chainId !== hederaChainId) {
        await switchChain({ chainId: hederaChainId });
      }

      // Get Hedera contract config
      const contractConfig = {
        address: hederaOappAddress,
        abi: contractABI,
        functionName: 'depositProtocolFunds',
        value: ethers.parseEther(hederaBridgeAmount),
        gasLimit: 100000
      };
      
      await writeHederaContract(contractConfig);
      
      // Success - clear the input
      setHederaBridgeAmount('');
      alert('HBAR bridge funds deposited successfully!');
    } catch (error) {
      console.error('Hedera bridge deposit error:', error);
      setHederaBridgeError(error.message || 'Failed to deposit HBAR bridge funds');
    } finally {
      setIsProcessingHederaBridge(false);
    }
  };

  const resetFundingForm = () => {
    setEthAmount('');
    setHederaAmount('');
    setEthBridgeAmount('');
    setHederaBridgeAmount('');
    setEthError('');
    setHederaError('');
    setEthBridgeError('');
    setHederaBridgeError('');
    setIsProcessingEth(false);
    setIsProcessingHedera(false);
    setIsProcessingEthBridge(false);
    setIsProcessingHederaBridge(false);
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
    clearNodeExecutionStates(); // Clear any previous execution states

    try {
      // Update blockchain service with current contract addresses
      blockchainService.updateContractAddresses(ethOappAddress, hederaOappAddress);

      // Sort nodes by position to get execution order
      const sortedNodes = [...activePlayground.nodes].sort((a, b) => a.position.x - b.position.x);
      const rules = [];

      // Sign each transaction/condition sequentially
      for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        const nodeData = node.data;
        
        // Set node to loading state
        updateNodeExecutionState(node.id, 'loading');
        
        // Debug logging
        console.log(`Processing node ${i + 1}:`, {
          type: node.type,
          id: node.id,
          data: nodeData
        });
        
        let result;
        if (node.type === 'conditionalNode' || nodeData.currencyMode) {
          // Validate conditional node inputs
          if (!nodeData.currencyMode) {
            throw new Error(`Node ${i + 1} conditional is missing currency mode`);
          }
          if (nodeData.currencyMode === 'single') {
            if (!nodeData.currencyA || !nodeData.operator || !nodeData.value) {
              throw new Error(`Node ${i + 1} conditional is incomplete (currency/operator/value)`);
            }
          } else {
            if (!nodeData.currencyA || !nodeData.currencyB || !nodeData.operator || !nodeData.value) {
              throw new Error(`Node ${i + 1} ratio is incomplete (currencyA/currencyB/operator/value)`);
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
            throw new Error(`Node ${i + 1} is missing required data (amount or wallet address)`);
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
          console.error(`Failed to process node ${i + 1}:`, result);
          updateNodeExecutionState(node.id, 'error');
          throw new Error(`Failed to process node ${i + 1}: ${result.error}`);
        }

        // Set node to completed state
        updateNodeExecutionState(node.id, 'completed');

        // Use on-chain rule id returned by transaction
        const currentRuleId = result.ruleId;

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

          // Find true and false target nodes
          for (const edge of connectedEdges) {
            const targetNode = sortedNodes.find(n => n.id === edge.target);
            if (targetNode && targetNode.type === 'entityNode') {
              // Find the rule ID for this target node by looking ahead in the sorted list
              const targetIndex = sortedNodes.findIndex(n => n.id === edge.target);
              if (targetIndex > i) {
                // This target node comes after current node, so it will have a rule ID
                // We need to account for the fact that rule IDs are assigned sequentially
                const targetRuleId = targetIndex; // This will be the index in the rules array
                
                if (edge.data?.type === 'conditional-true') {
                  trueRuleId = targetRuleId;
                } else if (edge.data?.type === 'conditional-false') {
                  falseRuleId = targetRuleId;
                }
              }
            }
          }
        }

        // Create rule object for API (linking will be set after loop)
        rules.push({
          rule_id: (node.type === 'conditionalNode' || nodeData.currencyMode) ? currentRuleId : (nodeData.isEth ? currentRuleId-1 : currentRuleId),
          operation: "cross chain",
          oapp_address: (node.type === 'conditionalNode' || nodeData.currencyMode) ? ethOappAddress : (nodeData.isEth ? ethOappAddress : hederaOappAddress),
          chain: (node.type === 'conditionalNode' || nodeData.currencyMode) ? "eth" : (nodeData.isEth ? "eth" : "hbar"),
          is_condition_branching: isConditionalBranching,
          next_id: null,
          is_true: trueRuleId,
          is_false: falseRuleId,
          is_terminated: 0
        });

        // Small delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Link rules by their actual on-chain ids
      for (let i = 0; i < rules.length; i++) {
        // Set next_id for sequential execution (only for non-conditional nodes)
        if (rules[i].is_condition_branching === 0) {
          rules[i].next_id = i < rules.length - 1 ? rules[i + 1].rule_id : null;
        } else {
          // Conditional nodes don't have sequential next_id
          rules[i].next_id = null;
        }
        
        // For conditional nodes, update true/false rule IDs to actual rule IDs
        if (rules[i].is_condition_branching === 1) {
          if (rules[i].is_true !== null) {
            // Find the actual rule ID for the true target
            const trueTargetIndex = rules[i].is_true;
            if (trueTargetIndex < rules.length) {
              rules[i].is_true = rules[trueTargetIndex].rule_id;
            }
          }
          if (rules[i].is_false !== null) {
            // Find the actual rule ID for the false target
            const falseTargetIndex = rules[i].is_false;
            if (falseTargetIndex < rules.length) {
              rules[i].is_false = rules[falseTargetIndex].rule_id;
            }
          }
        }
      }

      // Mark terminal nodes (nodes with no outgoing connections)
      for (let i = 0; i < rules.length; i++) {
        const isTerminal = !rules[i].next_id && !rules[i].is_true && !rules[i].is_false;
        rules[i].is_terminated = isTerminal ? 1 : 0;
      }


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
        alert(`✅ Workflow executed successfully!\nAll ${sortedNodes.length} transactions signed and submitted.`);
      } else {
        throw new Error(`API call failed: ${apiResult.error}`);
      }

    } catch (error) {
      console.error('Workflow execution error:', error);
      alert(`❌ Workflow execution failed: ${error.message}`);
    } finally {
      setIsExecutingWorkflow(false);
    }
  };


 
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
      {/* Playground Selector Button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={buttonStyles.secondary}
          {...motionProps}
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
                          className={buttonStyles.icon}
                          {...motionProps}
                        >
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        {playgrounds.length > 1 && (
                          <motion.button
                            onClick={(e) => handleDeletePlayground(playground.id, e)}
                            className={buttonStyles.iconDanger}
                            {...motionProps}
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
        className={buttonStyles.primary}
        {...motionProps}
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
                        className={buttonStyles.dropdown}
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
                    className={buttonStyles.dropdown}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Transaction Node
                  </button>
                  <button
                    onClick={() => handleAddNode('conditional')}
                    className={buttonStyles.dropdown}
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
          className={buttonStyles.primary}
          {...motionProps}
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
                className={buttonStyles.ghost}
                {...motionProps}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleCreatePlayground}
                className={buttonStyles.primary}
                {...motionProps}
              >
                Create
              </motion.button>
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
                    className={
                      !ethAmount || isProcessingEth || isEthPending
                        ? buttonStyles.disabled
                        : buttonStyles.primary
                    }
                    {...motionProps}
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
                    className={
                      !hederaAmount || isProcessingHedera || isHederaPending
                        ? buttonStyles.disabled
                        : buttonStyles.primary
                    }
                    {...motionProps}
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

              {/* Bridge Funding Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-900 mb-4">Bridge Deposits</h4>
                
                {/* ETH Bridge Funding */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    ETH Bridge Deposit
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={ethBridgeAmount}
                        onChange={(e) => {
                          setEthBridgeAmount(e.target.value);
                          setEthBridgeError('');
                        }}
                        placeholder="0.0"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          ethBridgeError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isProcessingEthBridge}
                      />
                      {ethBridgeError && (
                        <p className="text-xs text-red-600 mt-1">{ethBridgeError}</p>
                      )}
                    </div>
                    <motion.button
                      onClick={handleEthBridgeFunding}
                      disabled={!ethBridgeAmount || isProcessingEthBridge}
                      className={
                        !ethBridgeAmount || isProcessingEthBridge
                          ? buttonStyles.disabled
                          : buttonStyles.primary
                      }
                      {...motionProps}
                    >
                      {isProcessingEthBridge ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Bridging...
                        </div>
                      ) : (
                        'Bridge ETH'
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Hedera Bridge Funding */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    HBAR Bridge Deposit
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={hederaBridgeAmount}
                        onChange={(e) => {
                          setHederaBridgeAmount(e.target.value);
                          setHederaBridgeError('');
                        }}
                        placeholder="0.0"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm ${
                          hederaBridgeError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isProcessingHederaBridge}
                      />
                      {hederaBridgeError && (
                        <p className="text-xs text-red-600 mt-1">{hederaBridgeError}</p>
                      )}
                    </div>
                    <motion.button
                      onClick={handleHederaBridgeFunding}
                      disabled={!hederaBridgeAmount || isProcessingHederaBridge}
                      className={
                        !hederaBridgeAmount || isProcessingHederaBridge
                          ? buttonStyles.disabled
                          : buttonStyles.primary
                      }
                      {...motionProps}
                    >
                      {isProcessingHederaBridge ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Bridging...
                        </div>
                      ) : (
                        'Bridge HBAR'
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-blue-600">
                    ℹ️ Wallet will prompt to switch networks for bridge transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => {
                    setIsFundingOpen(false);
                    resetFundingForm();
                  }}
                  className={buttonStyles.ghost}
                  {...motionProps}
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
