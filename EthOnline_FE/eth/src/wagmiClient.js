import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask } from '@wagmi/connectors';

// Set up the Wagmi config.
export const config = createConfig({
  chains: [sepolia],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/oIYpahzrgNt5HRj3VtqwTwdYsJyc9ymZ'), // 👈 your custom RPC
  },
});