import { createContext } from 'react';

export const PlaygroundContext = createContext({
  playgrounds: [],
  activePlayground: null,
  activePlaygroundId: null,
  setActivePlaygroundId: () => {},
  createPlayground: () => {},
  updatePlayground: () => {},
  updateActivePlayground: () => {},
  deletePlayground: () => {},
  renamePlayground: () => {},
  clearActivePlayground: () => {},
  connectAllNodes: () => {},
  setConnectAllNodesFn: () => {},
  // Deployment addresses
  ethOappAddress: null,
  hederaOappAddress: null,
  setDeploymentAddresses: () => {},
});
