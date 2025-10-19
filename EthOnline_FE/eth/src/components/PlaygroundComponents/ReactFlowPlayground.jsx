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
import CustomEdge from './CustomEdge';
import ConnectionPopup from './ConnectionPopup';
import { usePlayground } from '../../hooks/usePlayground';

// Define the node types (moved outside component to prevent recreation)
const nodeTypes = {
  entityNode: EntityNode,
};

// Define the edge types (moved outside component to prevent recreation)
const edgeTypes = {
  default: CustomEdge,
};

const ReactFlowPlayground = () => {
  const { activePlayground, updateActivePlayground, clearActivePlayground, setConnectAllNodesFn } = usePlayground();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [popupState, setPopupState] = useState({ isOpen: false, nodeData: null });
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

  // Entities data
  const entities = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'File storage and management',
      category: 'Storage'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Email automation',
      category: 'Communication'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication',
      category: 'Communication'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Note taking and docs',
      category: 'Productivity'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository',
      category: 'Development'
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Project management',
      category: 'Productivity'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Schedule management',
      category: 'Productivity'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'HTTP requests',
      category: 'Integration'
    }
  ];

  // Inline brand-like icons (simplified) for collapsed sidebar
  const entityIcons = {
    'google-drive': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <path fill="#34A853" d="M7.5 20.5L1 9.5l3.5-6 6.5 11z"/>
        <path fill="#FBBC05" d="M23 14.5l-3.5 6H7.5l3.5-6z"/>
        <path fill="#4285F4" d="M10.5 8.5L7 2.5h7l6.5 11H14z"/>
      </svg>
    ),
    'gmail': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <path fill="#EA4335" d="M12 11L3 5v14h3V9.5L12 15l6-5.5V19h3V5z"/>
        <path fill="#34A853" d="M3 19h3V9.5z"/>
        <path fill="#FBBC05" d="M21 19h-3V9.5z"/>
      </svg>
    ),
    'slack': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <path fill="#36C5F0" d="M7 10a2 2 0 110-4 2 2 0 010 4zM8 11h2v6a2 2 0 11-2-2V11z"/>
        <path fill="#2EB67D" d="M14 8a2 2 0 114 0 2 2 0 01-4 0zM13 6h-2V0a2 2 0 112 2v4z"/>
        <path fill="#ECB22E" d="M16 13a2 2 0 110 4 2 2 0 010-4zM18 12V10h6a2 2 0 11-2 2h-4z"/>
        <path fill="#E01E5A" d="M10 16a2 2 0 110 4 2 2 0 010-4zM11 18h1.999V24a2 2 0 11-2-2V18z"/>
      </svg>
    ),
    'notion': (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#111827"/>
        <path d="M9 17V8h1.5l4 6.2V8H16v9h-1.5L10 10.8V17H9z" fill="#111827"/>
      </svg>
    ),
    'github': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <path fill="#111827" d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.33-1.77-1.33-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.98 0-1.32.47-2.4 1.24-3.25-.13-.31-.54-1.57.12-3.27 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 016 0c2.3-1.56 3.3-1.24 3.3-1.24.66 1.7.25 2.96.12 3.27.78.85 1.24 1.93 1.24 3.25 0 4.65-2.8 5.67-5.48 5.97.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0012 .5z"/>
      </svg>
    ),
    'trello': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#0052CC"/>
        <rect x="6.5" y="6.5" width="5" height="11" rx="1" fill="#fff"/>
        <rect x="12.5" y="6.5" width="5" height="6" rx="1" fill="#fff"/>
      </svg>
    ),
    'calendar': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <rect x="3" y="4" width="18" height="17" rx="2" fill="#2563EB"/>
        <rect x="3" y="8" width="18" height="13" fill="#EFF6FF"/>
        <path d="M7 2v4M17 2v4" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'webhook': (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
        <path fill="#9333EA" d="M7.5 17a3.5 3.5 0 116.6-1.5h-2.2a1.3 1.3 0 100 2.5H15A3.5 3.5 0 1117 11h-2a1.25 1.25 0 110-2.5h2A5.5 5.5 0 1113 14h-1.1A3.5 3.5 0 017.5 17z"/>
      </svg>
    ),
  };

  const deleteEdge = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
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
    }, eds)),
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

      const entity = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      // Check if the dropped element is valid
      if (typeof entity === 'undefined' || !entity) {
        console.warn('Invalid entity data');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${entity.id}-${Date.now()}`,
        type: 'entityNode',
        position,
        data: { entity },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const clearPlayground = () => {
    setNodes([]);
    setEdges([]);
    clearActivePlayground();
  };

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setPopupState({ isOpen: true, nodeData: node });
  }, []);

  const handleClosePopup = () => {
    setPopupState({ isOpen: false, nodeData: null });
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

  

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar (collapsed by default, expands on hover) */}
      <div className="group/sidebar bg-gray-50 border-r border-gray-100 h-[85vh] flex flex-col overflow-hidden transition-all duration-300 w-16 hover:w-72">

        {/* Entities List */}
        <div className="flex-1 overflow-y-auto p-2 group-hover/sidebar:p-4 space-y-2">
          {entities.map((entity, index) => (
            <motion.div
              key={entity.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('application/reactflow', JSON.stringify(entity));
              }}
              className="bg-white hover:bg-gray-50 border border-gray-100 rounded-lg px-2 py-2 group-hover/sidebar:p-4 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                  {entityIcons[entity.id]}
                </div>
                <div className="min-w-0 opacity-0 translate-x-[-6px] group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{entity.name}</h3>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full hidden group-hover/sidebar:inline-block">
                      {entity.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-2 hidden group-hover/sidebar:block">{entity.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 group-hover/sidebar:p-4 border-t border-gray-100 bg-white">
          <motion.button
            onClick={clearPlayground}
            className="hidden group-hover/sidebar:block w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Clear Workspace
          </motion.button>
        </div>
      </div>

      {/* Main Playground */}
      <div className="flex-1 flex flex-col bg-gray-50 h-[85vh]">
        {/* React Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                onDelete: () => deleteNode(node.id)
              }
            }))}
            edges={edges.map(edge => ({
              ...edge,
              data: {
                ...edge.data,
                onDelete: () => deleteEdge(edge.id)
              }
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
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
                  Drag entities from the sidebar to start building your workflow
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Connect entities to create automation flows</span>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Hover over nodes to delete them</p>
                    <p>• Hover over connections to remove them</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Popup */}
      <ConnectionPopup
        isOpen={popupState.isOpen}
        onClose={handleClosePopup}
        nodeData={popupState.nodeData}
      />
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
