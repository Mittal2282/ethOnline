import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { blockchainService } from '../../services/blockchainService';
import { usePlayground } from '../../hooks/usePlayground';

const EntityNode = ({ data, isConnectable }) => {
  const { ethOappAddress, hederaOappAddress } = usePlayground();
  const [isEth, setIsEth] = useState(data?.isEth ?? true);
  const [value, setValue] = useState(data?.value ?? '');
  const [walletAddress, setWalletAddress] = useState(data?.walletAddress ?? '');
  const [isSigning, setIsSigning] = useState(false);
  const [signingResult, setSigningResult] = useState(null);

  const handleToggle = () => {
    const newIsEth = !isEth;
    setIsEth(newIsEth);
    // Update the data in the parent component
    if (data?.onUpdate) {
      data.onUpdate({ isEth: newIsEth, value, walletAddress });
    }
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data?.onUpdate) {
      data.onUpdate({ isEth, value: newValue, walletAddress });
    }
  };

  const handleWalletChange = (e) => {
    const newWalletAddress = e.target.value;
    setWalletAddress(newWalletAddress);
    if (data?.onUpdate) {
      data.onUpdate({ isEth, value, walletAddress: newWalletAddress });
    }
  };

  const handleSignTransaction = async () => {
    if (!value || !walletAddress) {
      alert('Please fill in both amount and wallet address');
      return;
    }

    // Check if contract addresses are available
    const contractAddress = isEth ? ethOappAddress : hederaOappAddress;
    if (!contractAddress) {
      const network = isEth ? 'Ethereum' : 'Hedera';
      alert(`${network} contract address not available. Please deploy contracts first.`);
      return;
    }

    setIsSigning(true);
    setSigningResult(null);

    try {
      // Update blockchain service with current contract addresses
      blockchainService.updateContractAddresses(ethOappAddress, hederaOappAddress);

      const result = await blockchainService.createNativeRule({
        isEth,
        value,
        walletAddress
      });

      if (result.success) {
        setSigningResult({
          success: true,
          ruleId: result.ruleId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        });
        alert(`✅ Transaction successful!\nRule ID: ${result.ruleId}\nTransaction Hash: ${result.transactionHash}`);
      } else {
        setSigningResult({
          success: false,
          error: result.error
        });
        alert(`❌ Transaction failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sign transaction error:', error);
      setSigningResult({
        success: false,
        error: error.message
      });
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <motion.div
      className="group relative bg-white border border-gray-200 rounded-lg shadow-sm min-w-[280px] hover:shadow-md transition-shadow duration-200"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: '#374151',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />

      {/* Delete Button - Top Right */}
      {data?.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full z-10"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              Transaction Node {data?.nodeNumber ? `#${data.nodeNumber}` : ''}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${isEth ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {isEth ? 'ETH' : 'Hedera'}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isEth ? 'bg-blue-600' : 'bg-purple-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-600">
              {isEth ? 'Ethereum' : 'Hedera'}
            </span>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={value}
              onChange={handleValueChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Wallet Address Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Destination Wallet
            </label>
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={walletAddress}
              onChange={handleWalletChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Sign Transaction Button */}
          <div className="pt-2">
            <button
              disabled={!value || !walletAddress || isSigning || !(isEth ? ethOappAddress : hederaOappAddress)}
              className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                value && walletAddress && !isSigning && (isEth ? ethOappAddress : hederaOappAddress)
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={handleSignTransaction}
              title={!(isEth ? ethOappAddress : hederaOappAddress) ? `${isEth ? 'Ethereum' : 'Hedera'} contract not deployed` : ''}
            >
              {isSigning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing...
                </div>
              ) : !(isEth ? ethOappAddress : hederaOappAddress) ? (
                `${isEth ? 'ETH' : 'HBAR'} Contract Not Deployed`
              ) : (
                'Sign Transaction'
              )}
            </button>
          </div>

          {/* Transaction Result */}
          {signingResult && (
            <div className={`p-2 rounded-lg text-xs ${
              signingResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {signingResult.success ? (
                <div>
                  <div className="font-medium">✅ Transaction Successful</div>
                  <div>Rule ID: {signingResult.ruleId}</div>
                  <div className="truncate">Hash: {signingResult.transactionHash}</div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">❌ Transaction Failed</div>
                  <div>{signingResult.error}</div>
                </div>
              )}
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${value && walletAddress ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-400">
                {value && walletAddress ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {isEth ? 'ETH' : 'HBAR'}
            </div>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: '#374151',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
        isConnectable={isConnectable}
      />
    </motion.div>
  );
};

export default EntityNode;
