import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { metaMask } from '@wagmi/connectors';

// Define Hedera Testnet chain
const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://compatible-omniscient-theorem.hedera-testnet.quiknode.pro/b0b1b5cd783d39fc86da9afa59631f74310a98c0'],
    },
    public: {
      http: ['https://compatible-omniscient-theorem.hedera-testnet.quiknode.pro/b0b1b5cd783d39fc86da9afa59631f74310a98c0'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet',
    },
  },
  testnet: true,
});

// Set up the Wagmi config.
export const config = createConfig({
  chains: [sepolia, hederaTestnet],
  connectors: [metaMask()],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/oIYpahzrgNt5HRj3VtqwTwdYsJyc9ymZ'), // Alchemy Sepolia RPC
    [hederaTestnet.id]: http('https://compatible-omniscient-theorem.hedera-testnet.quiknode.pro/b0b1b5cd783d39fc86da9afa59631f74310a98c0'), // Hedera Testnet RPC
  },
});