import { ethers } from 'ethers';
import abi from '../data/abi.json';
import { BLOCKCHAIN_CONFIG } from '../config/blockchainConfig';
import { HermesClient } from '@pythnetwork/hermes-client';

// Configuration
const {
  PRIVATE_KEY,
  RPC_URL,
  HEDERA_RPC_URL
} = BLOCKCHAIN_CONFIG;

// RuleAction enum values
const RuleAction = {
  NativeTransfer: 0,
  CrossChainTransfer: 1
};

// Operator enum values
const Operator = {
  GT: 0,  // Greater than
  LT: 1,  // Less than
  EQ: 2,  // Equal to
  GTE: 3, // Greater than or equal
  LTE: 4, // Less than or equal
  NEQ: 5, // Not equal
};

// Pyth price feed ids (bytes32) for testnets/mainnet as applicable
// NOTE: Provided by user. Update if your deployment requires different ids.
const PYTH_IDS = {
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  HBAR: '0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd',
};

function getPythIdForSymbol(symbol) {
  const key = String(symbol || '').toUpperCase();
  const pythId = PYTH_IDS[key] ?? ethers.ZeroHash;
  console.log(`Getting Pyth ID for ${symbol} (${key}):`, pythId);
  return pythId;
}

function mapOperatorStringToEnum(opStr) {
  // opStr examples: 'greater_than', 'less_than', 'equal_to', 'less_than_equal', 'greater_than_equal', 'not_equal'
  const normalized = String(opStr || '').toLowerCase();
  if (normalized === 'greater_than' || normalized === 'gt') return Operator.GT;
  if (normalized === 'less_than' || normalized === 'lt') return Operator.LT;
  if (normalized === 'equal_to' || normalized === 'eq' || normalized === 'equal') return Operator.EQ;
  if (normalized === 'less_than_equal' || normalized === 'lte') return Operator.LTE;
  if (normalized === 'greater_than_equal' || normalized === 'gte') return Operator.GTE;
  if (normalized === 'not_equal' || normalized === 'neq') return Operator.NEQ;
  // default
  return Operator.GT;
}

class BlockchainService {
  constructor(ethContractAddress, hederaContractAddress) {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.providerHedera = new ethers.JsonRpcProvider(HEDERA_RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.walletHedera = new ethers.Wallet(PRIVATE_KEY, this.providerHedera);
    
    // Initialize contracts with provided addresses
    this.contract = ethContractAddress ? new ethers.Contract(ethContractAddress, abi, this.wallet) : null;
    this.contractHedera = hederaContractAddress ? new ethers.Contract(hederaContractAddress, abi, this.walletHedera) : null;
  }

  // Method to update contract addresses
  updateContractAddresses(ethContractAddress, hederaContractAddress) {
    this.contract = ethContractAddress ? new ethers.Contract(ethContractAddress, abi, this.wallet) : null;
    this.contractHedera = hederaContractAddress ? new ethers.Contract(hederaContractAddress, abi, this.walletHedera) : null;
  }

  async createNativeRule(nodeData) {
    try {
      const { isEth, value, walletAddress } = nodeData;
      
      // Check if contract is available
      const contract = isEth ? this.contract : this.contractHedera;
      if (!contract) {
        const network = isEth ? 'Ethereum' : 'Hedera';
        throw new Error(`${network} contract address not available. Please deploy contracts first.`);
      }
      
      // Parse the amount based on the network
      const decimals = isEth ? 18 : 8; // ETH uses 18 decimals, HBAR uses 8
      const amount = ethers.parseUnits(value, decimals);
      
      // Create rule object
      const rule = {
        which_rule: `Send ${value} ${isEth ? 'ETH' : 'HBAR'} to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        recipient: walletAddress,
        amount: amount,
        action: RuleAction.NativeTransfer,
        dstEid: 0, // same chain
        slippageBps: 0,
        srcDecimals: decimals,
        dstDecimals: decimals
      };

      // Create condition object (no condition for now)
      const condition = {
        baseFeed: ethers.ZeroHash,
        quoteFeed: ethers.ZeroHash,
        threshold: 0,
        op: Operator.GT,
        isPair: false,
        enabled: false, // no condition
        pythPriceUpdate: []
      };

      console.log('Creating rule:', rule);
      console.log('With condition:', condition);

      // Send transaction
      const tx = await contract.createNativeRule(rule, condition);
      console.log('📤 Sent transaction:', tx.hash);

      // Wait for transaction receipt
      const receipt = await tx.wait();
      console.log('✅ Rule created in block:', receipt.blockNumber);

      // Get the rule ID
      const count = await contract.getCountRules();
      const ruleId = Number(count) - 1;
      console.log(`Rule ID for ${isEth ? 'ETH' : 'HBAR'} transfer:`, ruleId);

      return {
        success: true,
        ruleId: ruleId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Error creating native rule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a rule with a Pyth condition based on Conditional Node data
  async createConditionalRule(nodeData, userWalletAddress) {
    try {
      // Decide which chain to submit the rule to; default to ETH contract
      // You can enhance this to target a specific chain if needed
      const contract = this.contract ?? this.contractHedera;
      if (!contract) {
        throw new Error('No contract instance available. Please deploy/connect contracts first.');
      }

      const {
        currencyMode, // 'single' | 'ratio'
        operator,     // e.g., 'greater_than', 'less_than_equal', etc.
        value,         // numeric string
        currencyA,     // 'ETH' | 'HBAR'
        currencyB      // 'ETH' | 'HBAR' (only for ratio)
      } = nodeData || {};

      const baseFeed = getPythIdForSymbol(currencyMode === 'single' ? currencyA : currencyA);
      const quoteFeed = currencyMode === 'ratio' ? getPythIdForSymbol(currencyB) : ethers.ZeroHash;

      // Build threshold (value * 10^8) using ethers.parseUnits for precision
      let threshold;
      try {
        threshold = value ? ethers.parseUnits(String(value), 8) : 0n;
        console.log(`Threshold for value ${value}:`, threshold.toString());
      } catch (error) {
        console.error('Error parsing threshold:', error);
        throw new Error(`Invalid threshold value: ${error.message}`);
      }
      
      const op = mapOperatorStringToEnum(operator);
      const isPair = currencyMode === 'ratio';

      // Prepare Pyth Hermes client request
      const priceIds = isPair ? [baseFeed, quoteFeed] : [baseFeed];
      
      console.log('Fetching price updates for priceIds:', priceIds);
      
      let priceUpdateDataArray = [];
      
      try {
        const hermes = new HermesClient();
        const priceFeedUpdateData = await hermes.getLatestPriceUpdates(priceIds);
        console.log('Price feed update data received:', priceFeedUpdateData);
        
        // Convert to 0x-prefixed hex strings as expected by the contract
        if (priceFeedUpdateData?.binary?.data) {
          console.log('Processing binary data:', priceFeedUpdateData.binary.data);
          priceUpdateDataArray = priceFeedUpdateData.binary.data.map((d, index) => {
            console.log(`Processing item ${index}:`, typeof d, d);
            return ethers.hexlify(d);
          });
        }
        console.log('Final priceUpdateDataArray:', priceUpdateDataArray);
      } catch (error) {
        console.error('Error fetching/processing price updates:', error);
        console.warn('⚠️ Falling back to empty price update data array - condition may not work properly');
        // Fallback: use empty array if Hermes fails
        priceUpdateDataArray = [];
      }

      // Build rule and condition args
      const ruleArgs = {
        which_rule: `${currencyA}${isPair ? `_${currencyB}` : ''}_${op}_${String(value ?? '')}`,
        recipient: userWalletAddress || this.wallet.address, // Use user's wallet address
        amount: 0, // Always 0 for conditional nodes
        action: RuleAction.NativeTransfer,
        dstEid: 0,
        slippageBps: 0,
        srcDecimals: 18,
        dstDecimals: 18,
      };

      const conditionArgs = {
        baseFeed,
        quoteFeed,
        threshold,
        op,
        isPair,
        enabled: true,
        pythPriceUpdate: priceUpdateDataArray,
      };

      console.log('Creating conditional rule with:', { ruleArgs, conditionArgs });
      
      let tx, receipt;
      try {
        tx = await contract.createNativeRule(ruleArgs, conditionArgs);
        console.log('📤 Sent transaction (conditional):', tx.hash);
        receipt = await tx.wait();
        console.log('✅ Conditional rule created in block:', receipt.blockNumber);
      } catch (error) {
        console.error('Error calling createNativeRule:', error);
        throw new Error(`Contract call failed: ${error.message}`);
      }

      const count = await contract.getCountRules();
      const ruleId = Number(count) - 1;

      return {
        success: true,
        ruleId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error creating conditional rule:', error);
      return { success: false, error: error.message };
    }
  }

  async getRuleCount() {
    try {
      const ethCount = this.contract ? await this.contract.getCountRules() : 0;
      const hederaCount = this.contractHedera ? await this.contractHedera.getCountRules() : 0;
      
      return {
        eth: Number(ethCount),
        hedera: Number(hederaCount)
      };
    } catch (error) {
      console.error('Error getting rule count:', error);
      return {
        eth: 0,
        hedera: 0
      };
    }
  }

  async getRule(ruleId, isEth = true) {
    try {
      const contract = isEth ? this.contract : this.contractHedera;
      if (!contract) {
        throw new Error(`${isEth ? 'Ethereum' : 'Hedera'} contract not available`);
      }
      const rule = await contract.getCountRules(ruleId);
      return rule;
    } catch (error) {
      console.error('Error getting rule:', error);
      return null;
    }
  }
}

// Export factory function to create blockchain service instances
export const createBlockchainService = (ethContractAddress, hederaContractAddress) => {
  return new BlockchainService(ethContractAddress, hederaContractAddress);
};

// Export default instance (will be updated with contract addresses)
export const blockchainService = new BlockchainService();
export { RuleAction, Operator };
