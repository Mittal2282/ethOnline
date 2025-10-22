import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import EntityNode from './EntityNode';
import ConditionalNode from './ConditionalNode';
import CustomEdge from './CustomEdge';
import { usePlayground } from '../../hooks/usePlayground';

// Define the node types (moved outside component to prevent recreation)
const nodeTypes = {
  entityNode: EntityNode,
  conditionalNode: ConditionalNode,
};

// Define the edge types (moved outside component to prevent recreation)
const edgeTypes = {
  default: CustomEdge,
};

const ReactFlowPlayground = () => {
  const { activePlayground, updateActivePlayground, setConnectAllNodesFn } = usePlayground();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  // Condition view modal state
  const [conditionView, setConditionView] = useState({ isOpen: false, text: '' });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize nodes and edges from active playground when it changes
  useEffect(() => {
    if (activePlayground) {
      setNodes(activePlayground.nodes || []);
      setEdges(activePlayground.edges || []);
      setIsInitialized(true);
    }
  }, [activePlayground, setNodes, setEdges]);

  // Update playground context when local state changes (with debouncing)
  useEffect(() => {
    if (isInitialized && activePlayground) {
      const timeoutId = setTimeout(() => {
        updateActivePlayground({ nodes, edges });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, isInitialized, activePlayground, updateActivePlayground]);


  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);
  
  // Node creation function
  const createNode = useCallback((nodeType) => {
    const position = reactFlowInstance ? reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }) : { x: 100, y: 100 };

    if (nodeType === 'transaction') {
      const nodeNumber = nodes.length + 1;
      const newNode = {
        id: `transaction-node-${Date.now()}`,
        type: 'entityNode',
        position,
        data: {
          isEth: true,
          value: '',
          walletAddress: '',
          nodeNumber: nodeNumber,
          onUpdate: (nodeData) => {
            setNodes((nds) => nds.map((node) => 
              node.id === newNode.id ? { ...node, data: { ...node.data, ...nodeData } } : node
            ));
          }
        },
      };
      setNodes((nds) => nds.concat(newNode));
    } else if (nodeType === 'conditional') {
      // Create only the conditional node
      const nodeNumber = nodes.length + 1;
      const conditionalNode = {
        id: `conditional-node-${Date.now()}`,
        type: 'conditionalNode',
        position,
        data: {
          currencyMode: 'single',
          operator: 'greater_than',
          value: '',
          currencyA: 'ETH',
          currencyB: 'HBAR',
          nodeNumber: nodeNumber,
          onUpdate: (nodeData) => {
            setNodes((nds) => nds.map((node) => 
              node.id === conditionalNode.id ? { ...node, data: { ...node.data, ...nodeData } } : node
            ));
          }
        },
      };

      setNodes((nds) => nds.concat(conditionalNode));
    }
  }, [reactFlowInstance, setNodes, nodes.length]);

  // Legacy function for backward compatibility
  const createTransactionNode = useCallback(() => {
    createNode('transaction');
  }, [createNode]);


 
  
  const onConnect = useCallback(
    (params) => {
      // Determine edge styling based on source handle for conditional edges
      let edgeStyle = {};
      let edgeData = { type: 'non-conditional', onDelete: (edgeId) => deleteEdge(edgeId) };
      
      // Check if this is coming from conditional node's true/false handles
      if (params.sourceHandle === 'true') {
        edgeStyle = {
          stroke: '#10B981', // Green for true condition
          strokeWidth: 2,
          strokeDasharray: '8,4'
        };
        edgeData.type = 'conditional-true';
      } else if (params.sourceHandle === 'false') {
        edgeStyle = {
          stroke: '#EF4444', // Red for false condition
          strokeWidth: 2,
          strokeDasharray: '8,4'
        };
        edgeData.type = 'conditional-false';
      } else {
        edgeStyle = {
          stroke: '#FFA500',
          strokeWidth: 1.5,
        };
        edgeData.type = 'non-conditional';
      }
      
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: edgeStyle,
        markerEnd: { type: 'arrowclosed', width: 12, height: 12, color: edgeStyle.stroke },
        data: edgeData
      }, eds));
    },
    [setEdges, deleteEdge]
  );


  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.warn('ReactFlow not ready for drop');
        return;
      }

      // Default to transaction node for drag and drop
      createNode('transaction');
    },
    [createNode, reactFlowInstance]
  );


  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };


  // Function to connect all nodes in sequence
  const connectAllNodes = useCallback(async () => {
    if (nodes.length < 2) return;

    // Sort nodes by their x position (left to right)
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    
    // Create edges connecting each node to the next one, but only if not already connected
    const newEdges = [];
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const sourceNode = sortedNodes[i];
      const targetNode = sortedNodes[i + 1];
      
      // Check if these nodes are already connected
      const alreadyConnected = edges.some(edge => 
        (edge.source === sourceNode.id && edge.target === targetNode.id) ||
        (edge.source === targetNode.id && edge.target === sourceNode.id)
      );
      
      if (!alreadyConnected) {
        newEdges.push({
          id: `connect-all-${sourceNode.id}-${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          animated: true,
          style: {
            stroke: '#FFA500',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: 'arrowclosed',
            width: 12,
            height: 12,
            color: '#374151',
          },
          data: {
            onDelete: (edgeId) => deleteEdge(edgeId)
          }
        });
      }
    }

    // Add edges one by one with a small delay for visual effect
    for (let i = 0; i < newEdges.length; i++) {
      setEdges((eds) => [...eds, newEdges[i]]);
      if (i < newEdges.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between connections
      }
    }
  }, [nodes, edges, setEdges, deleteEdge]);

  // Register the connectAllNodes function with the context
  useEffect(() => {
    setConnectAllNodesFn(() => connectAllNodes);
    return () => setConnectAllNodesFn(null);
  }, [connectAllNodes, setConnectAllNodesFn]);

  // Function to connect specific nodes
  const connectSpecificNodes = useCallback((sourceId, targetId) => {
    // Find the source node to check if it's a conditional node
    const sourceNode = nodes.find(node => node.id === sourceId);
    const isConditionalNode = sourceNode?.type === 'conditionalNode';
    
    let edgeStyle = {};
    let edgeData = { type: 'non-conditional', onDelete: (edgeId) => deleteEdge(edgeId) };
    
    if (isConditionalNode) {
      // For conditional nodes, we need to determine which handle to use
      // For now, default to true handle (green) - this could be enhanced later
      edgeStyle = {
        stroke: '#10B981', // Green for true condition
        strokeWidth: 2,
        strokeDasharray: '8,4'
      };
      edgeData.type = 'conditional-true';
    } else {
      edgeStyle = {
        stroke: '#FFA500',
        strokeWidth: 1.5,
      };
      edgeData.type = 'non-conditional';
    }
    
    const newEdge = {
      id: `edge-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      animated: true,
      style: edgeStyle,
      markerEnd: { type: 'arrowclosed', width: 12, height: 12, color: edgeStyle.stroke },
      data: edgeData
    };

    setEdges((eds) => [...eds, newEdge]);
  }, [setEdges, deleteEdge, nodes]);

  // Expose createNode function globally for PlaygroundSelector to use
  useEffect(() => {
    window.addNode = createNode;
    window.addTransactionNode = createTransactionNode; // Keep for backward compatibility
    window.connectSpecificNodes = connectSpecificNodes;
    return () => {
      delete window.addNode;
      delete window.addTransactionNode;
      delete window.connectSpecificNodes;
    };
  }, [createNode, createTransactionNode, connectSpecificNodes]);

  

  return (
    <div className="flex h-full bg-white">
      {/* Main Playground */}
      <div className="flex-1 flex flex-col bg-gray-50 h-[85vh]">
        {/* React Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onDelete: () => deleteNode(node.id),
                onUpdate: (nodeData) => {
                  setNodes((nds) => nds.map((n) => 
                    n.id === node.id ? { ...n, data: { ...n.data, ...nodeData } } : n
                  ));
                }
              }
            }))}
            edges={edges.map(edge => ({
              ...edge,
              style: {
                ...(edge.style || {}),
                stroke: edge.data?.type === 'conditional-true' ? '#10B981' : 
                       edge.data?.type === 'conditional-false' ? '#EF4444' :
                       edge.data?.type === 'conditional' ? '#6366F1' : '#FFA500',
                strokeWidth: edge.data?.type?.includes('conditional') ? 2 : 1.5,
                strokeDasharray: edge.data?.type?.includes('conditional') ? '8,4' : undefined,
              },
              markerEnd: {
                type: 'arrowclosed', 
                width: 12, 
                height: 12, 
                color: edge.data?.type === 'conditional-true' ? '#10B981' : 
                       edge.data?.type === 'conditional-false' ? '#EF4444' :
                       edge.data?.type === 'conditional' ? '#6366F1' : '#374151'
              },
              data: {
                ...edge.data,
                onDelete: () => deleteEdge(edge.id),
                onShowCondition: () => {
                  if (edge.data?.type?.includes('conditional')) {
                    // Build readable text based on structured condition
                    const cond = edge.data?.condition || {};
                    let text = '';
                    if (cond.kind === 'time') {
                      const date = new Date(cond.valueIso);
                      text = `Execute at ${date.toLocaleString('en-US', { 
                        timeZone: 'UTC', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                      })}`;
                    } else if (cond.kind === 'currency') {
                      text = `Execute when ${cond.code} price reaches $${Number(cond.usd).toLocaleString()}`;
                    } else {
                      text = String(cond || '');
                    }
                    setConditionView({ isOpen: true, text });
                  }
                }
              }
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            connectionRadius={40}
            fitView
            attributionPosition="bottom-left"
            className="bg-white"
          >
            <Controls 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              style={{ backgroundColor: 'white' }}
            />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#f9fafb"
              nodeBorderRadius={4}
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              style={{ backgroundColor: 'white' }}
            />
            <Background 
              variant="dots" 
              gap={24} 
              size={0.8} 
              color="#e5e7eb"
            />
          </ReactFlow>
          
          {/* Empty Workspace Placeholder */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="text-center max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Empty Workspace</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Click "Add Node" in the toolbar to start building your workflow
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Connect transaction nodes to create automation flows</span>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Toggle between ETH and Hedera networks</p>
                    <p>• Set amount and destination wallet address</p>
                    <p>• Hover over nodes to delete them</p>
                    <p>• Hover over connections to remove them</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>



      {/* Condition View Modal */}
      {conditionView.isOpen && (
        <div>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setConditionView({ isOpen: false, text: '' })} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Condition Details</h3>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setConditionView({ isOpen: false, text: '' })}>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-4 py-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">Trigger Condition</p>
                      <p className="text-sm text-gray-700 break-words leading-relaxed">{conditionView.text || 'No condition specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
                <button className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors" onClick={() => setConditionView({ isOpen: false, text: '' })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const ReactFlowPlaygroundWrapper = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowPlayground />
    </ReactFlowProvider>
  );
};

export default ReactFlowPlaygroundWrapper;
