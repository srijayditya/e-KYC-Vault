'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

interface Props {
  contractAddress: string;
  abi: any;
}

export default function HolderTab({ contractAddress, abi }: Props) {
  const [verifierAddress, setVerifierAddress] = useState('');
  const [consentOn, setConsentOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleConsent = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.setConsent(verifierAddress, !consentOn);
      await tx.wait();
      setConsentOn(!consentOn);
      alert('Consent updated successfully!');
    } catch (error) {
      console.error(error);
      alert('Error updating consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Manage Consent</h2>
        <p className="text-gray-600">Grant or revoke access to your KYC credentials</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Verifier Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={verifierAddress}
            onChange={(e) => setVerifierAddress(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
          />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Current Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                {consentOn ? 'Access granted to verifier' : 'No active consent'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${consentOn ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
              {consentOn ? '✓ Active' : '○ Inactive'}
            </div>
          </div>
        </div>

        <button
          onClick={toggleConsent}
          disabled={loading || !verifierAddress}
          className={`w-full font-semibold px-6 py-3 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            consentOn
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : consentOn ? (
            '🔒 Revoke Consent'
          ) : (
            '🔓 Grant Consent'
          )}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Note:</span> Granting consent allows the verifier to access and verify your KYC credentials. You can revoke this access at any time.
          </p>
        </div>
      </div>
    </div>
  );
}