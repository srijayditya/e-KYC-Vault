'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);

  async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask not detected. Please install MetaMask extension.');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  }

  return (
    <div className="flex justify-center mb-4">
      {account ? (
        <p className="text-green-600 font-semibold">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}