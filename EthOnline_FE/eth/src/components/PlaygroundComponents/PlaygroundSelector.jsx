import React, { useState, useEffect } from 'react';
import { usePlayground } from '../../hooks/usePlayground';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import contractABI from '../../data/abi.json';
import { blockchainService } from '../../services/blockchainService';
import { workflowAPIService } from '../../services/workflowAPIService';
import PlaygroundDropdown from './PlaygroundDropdown';
import WorkflowControls from './WorkflowControls';
import BalanceDisplay from './BalanceDisplay';
import FundingModal from './FundingModal';
import TutorialModal from './TutorialModal';

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

  const motionProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  // Funding states
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Balance states
  const [ethUserBalance, setEthUserBalance] = useState('0');
  const [ethBridgeBalance, setEthBridgeBalance] = useState('0');
  const [hederaUserBalance, setHederaUserBalance] = useState('0');
  const [hederaBridgeBalance, setHederaBridgeBalance] = useState('0');
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  
  // Workflow execution states
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  
  const { isConnected, address } = useAccount();

  // Fetch contract balances
  const fetchContractBalances = async () => {
    if (!ethOappAddress && !hederaOappAddress) {
      return;
    }

    setIsLoadingBalances(true);

    try {
      // Fetch ETH contract balances
      if (ethOappAddress) {
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        const ethContract = new ethers.Contract(ethOappAddress, contractABI, provider);
        
        try {
          const userBal = await ethContract.userBalance();
          setEthUserBalance(ethers.formatEther(userBal));
        } catch (error) {
          console.error('Error fetching ETH user balance:', error);
          setEthUserBalance('0');
        }

        try {
          const bridgeBal = await ethContract.protocolBalance();
          setEthBridgeBalance(ethers.formatEther(bridgeBal));
        } catch (error) {
          console.error('Error fetching ETH bridge balance:', error);
          setEthBridgeBalance('0');
        }
      }

      // Fetch Hedera contract balances
      if (hederaOappAddress) {
        const hederaProvider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
        const hederaContract = new ethers.Contract(hederaOappAddress, contractABI, hederaProvider);
        
        try {
          const userBal = await hederaContract.userBalance();
          setHederaUserBalance(ethers.formatUnits(userBal, 8)); // HBAR uses 8 decimals
        } catch (error) {
          console.error('Error fetching Hedera user balance:', error);
          setHederaUserBalance('0');
        }

        try {
          const bridgeBal = await hederaContract.protocolBalance();
          setHederaBridgeBalance(ethers.formatUnits(bridgeBal, 8)); // HBAR uses 8 decimals
        } catch (error) {
          console.error('Error fetching Hedera bridge balance:', error);
          setHederaBridgeBalance('0');
        }
      }
    } catch (error) {
      console.error('Error fetching contract balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances on component mount and when contracts are available
  useEffect(() => {
    if (ethOappAddress || hederaOappAddress) {
      fetchContractBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethOappAddress, hederaOappAddress]);

  // Show tutorial on first visit to playground
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('playground-tutorial-seen');
    if (!hasSeenTutorial && isConnected && ethOappAddress && hederaOappAddress) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, ethOappAddress, hederaOappAddress]);

  // Tutorial handlers
  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
    localStorage.setItem('playground-tutorial-seen', 'true');
  };

  const handleStartFunding = () => {
    setIsFundingOpen(true);
    fetchContractBalances();
  };

  // Check if user has sufficient funds
  const hasSufficientFunds = () => {
    const ethBalance = parseFloat(ethUserBalance);
    const hederaBalance = parseFloat(hederaUserBalance);
    const ethBridgeBal = parseFloat(ethBridgeBalance);
    const hederaBridgeBal = parseFloat(hederaBridgeBalance);
    
    // Minimum thresholds (can be adjusted)
    const minEthBalance = 0.001;
    const minHederaBalance = 0.1;
    const minEthBridgeBalance = 0.001;
    const minHederaBridgeBalance = 0.1;
    
    return ethBalance >= minEthBalance && 
           hederaBalance >= minHederaBalance && 
           ethBridgeBal >= minEthBridgeBalance && 
           hederaBridgeBal >= minHederaBridgeBalance;
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

    // Check if user has sufficient funds
    if (!hasSufficientFunds()) {
      const shouldAddFunds = confirm(
        '⚠️ Insufficient funds detected!\n\n' +
        'You need minimum balances in your contracts:\n' +
        '• ETH: 0.001 ETH\n' +
        '• HBAR: 0.1 HBAR\n' +
        '• ETH Bridge: 0.001 ETH\n' +
        '• HBAR Bridge: 0.1 HBAR\n\n' +
        'Would you like to add funds now?'
      );
      
      if (shouldAddFunds) {
        setIsFundingOpen(true);
        fetchContractBalances();
      }
      return;
    }

    setIsExecutingWorkflow(true);
    clearNodeExecutionStates(); // Clear any previous execution states

    try {
      // Update blockchain service with current contract addresses
      blockchainService.updateContractAddresses(ethOappAddress, hederaOappAddress);

      // Sort nodes by position to get execution order
      const sortedNodes = [...activePlayground.nodes].sort((a, b) => a.position.x - b.position.x);
      console.log("sortedNodes", sortedNodes);
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
        } else if (node.type === 'swappingNode' || nodeData.swapDirection) {
          // Swapping node - validate required fields
          if (!nodeData.value) {
            throw new Error(`Node ${i + 1} swap is missing amount`);
          }
          if (!nodeData.swapDirection) {
            throw new Error(`Node ${i + 1} swap is missing swap direction`);
          }
          if (!nodeData.destinationWallet) {
            throw new Error(`Node ${i + 1} swap is missing destination wallet address`);
          }

          console.log('Calling createSwapRule with:', {
            swapDirection: nodeData.swapDirection,
            value: nodeData.value,
            destinationWallet: nodeData.destinationWallet
          });

          result = await blockchainService.createSwapRule({
            swapDirection: nodeData.swapDirection,
            value: nodeData.value,
            destinationWallet: nodeData.destinationWallet
          });
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

          console.log("connectedEdges", connectedEdges);

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

        // Determine chain and oapp address based on node type
        let chainName, oappAddr, adjustedRuleId;
        
        if (node.type === 'conditionalNode' || nodeData.currencyMode) {
          chainName = "eth";
          oappAddr = ethOappAddress;
          adjustedRuleId = currentRuleId;
        } else if (node.type === 'swappingNode' || nodeData.swapDirection) {
          // For swapping nodes, use source chain
          const isEthToHbar = nodeData.swapDirection === 'ethToHbar';
          chainName = isEthToHbar ? "eth" : "hbar";
          oappAddr = isEthToHbar ? ethOappAddress : hederaOappAddress;
          adjustedRuleId = isEthToHbar ? currentRuleId: currentRuleId;
        } else {
          // Transaction node
          chainName = nodeData.isEth ? "eth" : "hbar";
          oappAddr = nodeData.isEth ? ethOappAddress : hederaOappAddress;
          adjustedRuleId = nodeData.isEth ? currentRuleId : currentRuleId;
        }

        // Create rule object for API (linking will be set after loop)
        rules.push({
          rule_id: adjustedRuleId,
          operation: "cross chain",
          oapp_address: oappAddr,
          chain: chainName,
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
        userAddress: address,
        chain: rules[0].chain
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
        {/* Playground Management */}
        <PlaygroundDropdown
          playgrounds={playgrounds}
          activePlayground={activePlayground}
          activePlaygroundId={activePlaygroundId}
          onSelectPlayground={setActivePlaygroundId}
          onCreatePlayground={createPlayground}
          onDeletePlayground={deletePlayground}
          onRenamePlayground={renamePlayground}
        />

        {/* Workflow Controls */}
       
        {/* Balance Display and Add Funds */}
        {isConnected && ethOappAddress && hederaOappAddress && (
          <div className="flex items-center gap-2">
            

            <motion.button
              onClick={() => {
                setIsFundingOpen(true);
                fetchContractBalances();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              {...motionProps}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Add/Withdraw Funds
            </motion.button>

            <BalanceDisplay
              ethUserBalance={ethUserBalance}
              hederaUserBalance={hederaUserBalance}
              ethBridgeBalance={ethBridgeBalance}
              hederaBridgeBalance={hederaBridgeBalance}
              isLoadingBalances={isLoadingBalances}
              onRefresh={fetchContractBalances}
            />
          </div>
        )}
      </div>

      <WorkflowControls
          activePlayground={activePlayground}
          isConnected={isConnected}
          isExecutingWorkflow={isExecutingWorkflow}
          onExecuteWorkflow={handleExecuteWorkflow}
        />


      {/* Funding Modal */}
      <FundingModal
        isOpen={isFundingOpen}
        onClose={() => setIsFundingOpen(false)}
        ethOappAddress={ethOappAddress}
        hederaOappAddress={hederaOappAddress}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={handleTutorialClose}
        onStartFunding={handleStartFunding}
      />
    </div>
  );
};

export default PlaygroundSelector;
