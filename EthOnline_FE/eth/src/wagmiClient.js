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
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
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
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/F3ANEM0KCH5b4R3Dmfsof'), // Alchemy Sepolia RPC
    [hederaTestnet.id]: http('https://testnet.hashio.io/api'), // Hedera Testnet RPC
  },
});