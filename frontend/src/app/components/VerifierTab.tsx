'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

interface Props {
  contractAddress: string;
  abi: any;
}

export default function VerifierTab({ contractAddress, abi }: Props) {
  const [holderAddress, setHolderAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkValidity = async () => {
    if (!holderAddress || !file) return alert('Enter holder address & file');

    try {
      setLoading(true);
      
      // Validate Ethereum address
      if (!ethers.isAddress(holderAddress)) {
        alert('Please enter a valid Ethereum address');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      // Read file and calculate hash
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to hex string and then hash
      const hexString = ethers.hexlify(uint8Array);
      const hashBytes = ethers.keccak256(hexString);

      const valid = await contract.verify(holderAddress, hashBytes);
      setIsValid(valid);
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying credential. Please check the console for details.');
      setIsValid(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify KYC Credential</h2>
        <p className="text-gray-600">Check the validity of a holder's KYC credential</p>
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            KYC Document to Verify
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold hover:file:bg-purple-100 cursor-pointer transition-all"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-semibold">{file.name}</span> 
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          onClick={checkValidity}
          disabled={loading || !holderAddress || !file}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            '🔍 Check Validity'
          )}
        </button>

        {isValid !== null && (
          <div
            className={`p-6 rounded-lg border-2 transition-all duration-500 ${
              isValid
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Verification Result
                </h3>
                <p className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {isValid
                    ? 'This credential is valid and verified on the blockchain'
                    : 'This credential could not be verified or does not exist'}
                </p>
              </div>
              <div
                className={`text-4xl ${
                  isValid ? 'animate-bounce' : 'animate-pulse'
                }`}
              >
                {isValid ? '✅' : '❌'}
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">⚠️ Important:</span> Make sure you have the holder's consent before attempting to verify their credentials.
          </p>
        </div>
      </div>
    </div>
  );
}