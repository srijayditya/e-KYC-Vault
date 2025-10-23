'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

interface Props {
  contractAddress: string;
  abi: any;
}

export default function IssuerTab({ contractAddress, abi }: Props) {
  const [holderAddress, setHolderAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const issueCredential = async () => {
    if (!holderAddress || !file) return alert('Enter address & file');

    // Validate Ethereum address
    if (!ethers.isAddress(holderAddress)) {
      return alert('Invalid holder address format');
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      
      // Handle ABI properly - check if it's already an array or needs to be accessed
      const contractAbi = Array.isArray(abi) ? abi : abi.abi || abi;
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const arrayBuffer = await file.arrayBuffer();
      const hashBytes = ethers.keccak256(new Uint8Array(arrayBuffer));

      console.log('Issuing credential to:', holderAddress);
      console.log('Document hash:', hashBytes);

      // Send transaction
      const tx = await contract.issueCredential(holderAddress, hashBytes);
      console.log('Transaction sent:', tx.hash);
      
      alert('Transaction sent! Please wait for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      alert('✅ Credential issued successfully!');
      setHolderAddress('');
      setFile(null);
    } catch (error: any) {
      console.error('Error details:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transaction was rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        alert('Insufficient funds to complete transaction');
      } else if (error.message?.includes('user rejected')) {
        alert('Transaction was rejected in MetaMask');
      } else {
        alert(`Error issuing credential: ${error.reason || error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Issue KYC Credential</h2>
        <p className="text-gray-600">Upload and issue KYC credentials to holder addresses</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Holder Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={holderAddress}
            onChange={(e) => setHolderAddress(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            KYC Document
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 cursor-pointer transition-all"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-semibold">{file.name}</span>
            </p>
          )}
        </div>

        <button
          onClick={issueCredential}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Issuing Credential...
            </span>
          ) : (
            'Issue Credential'
          )}
        </button>
      </div>
    </div>
  );
}