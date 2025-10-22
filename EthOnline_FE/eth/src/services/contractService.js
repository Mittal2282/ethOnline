import { parseEther } from 'viem';
import abi from '../data/abi.json';

class ContractService {
  constructor() {
    this.abi = abi;
  }

  // Get the depositNative function ABI
  getDepositNativeAbi() {
    return this.abi.find(item => item.name === 'depositNative');
  }

  // Get contract configuration for wagmi
  getContractConfig(address) {
    return {
      address: address,
      abi: this.abi,
    };
  }

  // Prepare transaction data for depositNative
  prepareDepositTransaction(amount) {
    return {
      functionName: 'depositNative',
      args: [],
      value: parseEther(amount.toString()),
    };
  }
}

export const contractService = new ContractService();
