import React, { useState, useCallback, useEffect } from 'react';
import { PlaygroundContext } from './PlaygroundContextDefinition';

const STORAGE_KEY = 'playgrounds-data';
const DEFAULT_PLAYGROUND = {
  id: 'playground-1',
  name: 'Playground1',
  nodes: [],
  edges: [],
  createdAt: new Date().toISOString()
};

export const PlaygroundProvider = ({ children }) => {
  const [playgrounds, setPlaygrounds] = useState([DEFAULT_PLAYGROUND]);
  const [activePlaygroundId, setActivePlaygroundId] = useState('playground-1');
  const [ethOappAddress, setEthOappAddress] = useState(null);
  const [hederaOappAddress, setHederaOappAddress] = useState(null);
  const [nodeExecutionStates, setNodeExecutionStates] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.playgrounds && parsedData.playgrounds.length > 0) {
          setPlaygrounds(parsedData.playgrounds);
          setActivePlaygroundId(parsedData.activePlaygroundId || parsedData.playgrounds[0].id);
        }
        // Load deployment addresses
        console.log('Loading deployment addresses from localStorage:', {
          eth: parsedData.ethOappAddress,
          hedera: parsedData.hederaOappAddress
        });
        if (parsedData.ethOappAddress) {
          setEthOappAddress(parsedData.ethOappAddress);
        }
        if (parsedData.hederaOappAddress) {
          setHederaOappAddress(parsedData.hederaOappAddress);
        }
      }
    } catch (error) {
      console.error('Error loading playgrounds from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever playgrounds, activePlaygroundId, or deployment addresses change
  useEffect(() => {
    try {
      const dataToSave = {
        playgrounds,
        activePlaygroundId,
        ethOappAddress,
        hederaOappAddress
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving playgrounds to localStorage:', error);
    }
  }, [playgrounds, activePlaygroundId, ethOappAddress, hederaOappAddress]);

  const activePlayground = playgrounds.find(p => p.id === activePlaygroundId);

  const createPlayground = useCallback((name) => {
    const newPlayground = {
      id: `playground-${Date.now()}`,
      name: name || `Playground${playgrounds.length + 1}`,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString()
    };
    
    setPlaygrounds(prev => [...prev, newPlayground]);
    setActivePlaygroundId(newPlayground.id);
    return newPlayground;
  }, [playgrounds.length]);

  const updatePlayground = useCallback((playgroundId, updates) => {
    setPlaygrounds(prev => 
      prev.map(playground => 
        playground.id === playgroundId 
          ? { ...playground, ...updates }
          : playground
      )
    );
  }, []);

  const updateActivePlayground = useCallback((updates) => {
    if (activePlaygroundId) {
      updatePlayground(activePlaygroundId, updates);
    }
  }, [activePlaygroundId, updatePlayground]);

  const deletePlayground = useCallback((playgroundId) => {
    if (playgrounds.length <= 1) {
      // Don't allow deleting the last playground
      return;
    }
    
    setPlaygrounds(prev => prev.filter(p => p.id !== playgroundId));
    
    // If we deleted the active playground, switch to the first remaining one
    if (playgroundId === activePlaygroundId) {
      const remainingPlaygrounds = playgrounds.filter(p => p.id !== playgroundId);
      setActivePlaygroundId(remainingPlaygrounds[0]?.id || null);
    }
  }, [playgrounds, activePlaygroundId]);

  const renamePlayground = useCallback((playgroundId, newName) => {
    updatePlayground(playgroundId, { name: newName });
  }, [updatePlayground]);

  const clearActivePlayground = useCallback(() => {
    if (activePlaygroundId) {
      updatePlayground(activePlaygroundId, { nodes: [], edges: [] });
    }
  }, [activePlaygroundId, updatePlayground]);

  // Function to connect all nodes in sequence - will be set by ReactFlowPlayground
  const [connectAllNodesFn, setConnectAllNodesFn] = useState(null);
  
  const connectAllNodes = useCallback(() => {
    if (connectAllNodesFn) {
      connectAllNodesFn();
    }
  }, [connectAllNodesFn]);

  const setDeploymentAddresses = useCallback((ethAddress, hederaAddress) => {
    setEthOappAddress(ethAddress);
    setHederaOappAddress(hederaAddress);
  }, []);

  // Node execution state management
  const updateNodeExecutionState = useCallback((nodeId, state) => {
    setNodeExecutionStates(prev => ({
      ...prev,
      [nodeId]: state
    }));
  }, []);

  const clearNodeExecutionStates = useCallback(() => {
    setNodeExecutionStates({});
  }, []);

  const getNodeExecutionState = useCallback((nodeId) => {
    return nodeExecutionStates[nodeId] || 'idle';
  }, [nodeExecutionStates]);

  const value = {
    playgrounds,
    activePlayground,
    activePlaygroundId,
    setActivePlaygroundId,
    createPlayground,
    updatePlayground,
    updateActivePlayground,
    deletePlayground,
    renamePlayground,
    clearActivePlayground,
    connectAllNodes,
    setConnectAllNodesFn,
    ethOappAddress,
    hederaOappAddress,
    setDeploymentAddresses,
    nodeExecutionStates,
    updateNodeExecutionState,
    clearNodeExecutionStates,
    getNodeExecutionState
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
};
