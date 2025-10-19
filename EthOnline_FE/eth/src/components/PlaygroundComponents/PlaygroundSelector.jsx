import React, { useState } from 'react';
import { usePlayground } from '../../hooks/usePlayground';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const PlaygroundSelector = () => {
  const {
    playgrounds,
    activePlayground,
    activePlaygroundId,
    setActivePlaygroundId,
    createPlayground,
    deletePlayground,
    renamePlayground,
    connectAllNodes
  } = usePlayground();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaygroundName, setNewPlaygroundName] = useState('');
  const [editingPlayground, setEditingPlayground] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

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

  const handleConnectAll = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      await connectAllNodes();
      // Show success feedback
      setTimeout(() => setIsConnecting(false), 1000);
    } catch (error) {
      console.error('Error connecting nodes:', error);
      setIsConnecting(false);
    }
  };

  // Check if there are any nodes that can be connected (not all already connected)
  const hasUnconnectedNodes = () => {
    if (!activePlayground?.nodes || activePlayground.nodes.length < 2) return false;
    
    const nodes = activePlayground.nodes;
    const edges = activePlayground.edges || [];
    
    // Sort nodes by x position
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    
    // Check if any adjacent nodes are not connected
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const sourceNode = sortedNodes[i];
      const targetNode = sortedNodes[i + 1];
      
      const alreadyConnected = edges.some(edge => 
        (edge.source === sourceNode.id && edge.target === targetNode.id) ||
        (edge.source === targetNode.id && edge.target === sourceNode.id)
      );
      
      if (!alreadyConnected) {
        return true;
      }
    }
    
    return false;
  };

 
  return (
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
 {/* Connect All Button - Only show when 2+ nodes exist and there are unconnected nodes */}
        {hasUnconnectedNodes() && (
          <motion.button
            onClick={handleConnectAll}
            disabled={isConnecting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
              isConnecting 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
            whileHover={!isConnecting ? { scale: 1.02 } : {}}
            whileTap={!isConnecting ? { scale: 0.98 } : {}}
          >
            {isConnecting ? (
              <>
                <motion.svg 
                  className="w-3.5 h-3.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect All
              </>
            )}
          </motion.button>
        )}

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
    </div>
  );
};

export default PlaygroundSelector;
