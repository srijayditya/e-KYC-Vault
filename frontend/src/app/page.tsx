'use client';
import { useState, useEffect } from 'react';
import IssuerTab from './components/IssuerTab';
import HolderTab from './components/HolderTab';
import VerifierTab from './components/VerifierTab';
import abi from './contracts/KycVault.json'; // Your compiled ABI JSON

const CONTRACT_ADDRESS = '0xF22335F9e4C35E3EAB6E0599AB64E5817582A3a9';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'issuer' | 'holder' | 'verifier'>('issuer');
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState<string>('');

  useEffect(() => {
    checkIfWalletIsConnected();
    
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!(window as any).ethereum) {
        return;
      }

      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        getNetwork();
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount('');
    }
  };

  const getNetwork = async () => {
    try {
      const chainId = await (window as any).ethereum.request({ 
        method: 'eth_chainId' 
      });
      const networks: { [key: string]: string } = {
        '0x1': 'Ethereum Mainnet',
        '0x5': 'Goerli Testnet',
        '0xaa36a7': 'Sepolia Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Mumbai Testnet',
      };
      setNetwork(networks[chainId] || `Chain ID: ${chainId}`);
    } catch (error) {
      console.error('Error getting network:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        alert('Please install MetaMask to use this dApp!');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      await getNetwork();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setNetwork('');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Wallet */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1"></div>
            
            <div className="flex-1 flex justify-center">
              <div className="inline-block">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  e-KYC Vault DApp
                </h1>
                <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full"></div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex-1 flex justify-end">
              {!account ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.5 8.5L23 18L32.5 31.5L42 18L32.5 8.5Z" fill="white"/>
                      <path d="M23 18L13.5 8.5L4 18L13.5 31.5L23 18Z" fill="white" opacity="0.7"/>
                    </svg>
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 min-w-[280px]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-gray-500">Connected</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Address</p>
                      <p className="font-mono font-bold text-sm text-gray-800">
                        {truncateAddress(account)}
                      </p>
                    </div>
                    
                    {network && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2">
                        <p className="text-xs text-gray-800">
                          <span className="font-semibold">🌐</span> {network}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-gray-600 text-lg">
            Secure, Decentralized Identity Verification on Blockchain
          </p>
        </div>

        {/* Warning if wallet not connected */}
        {!account && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Wallet Not Connected</h3>
                <p className="text-gray-700 mb-3">
                  Please connect your MetaMask wallet to interact with the e-KYC Vault smart contract.
                </p>
                <button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-5 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  Connect Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setActiveTab('issuer')}
            disabled={!account}
            className={`
              relative px-8 py-3 rounded-xl font-semibold text-white
              transition-all duration-300 transform
              ${!account ? 'opacity-50 cursor-not-allowed' : ''}
              ${activeTab === 'issuer' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg scale-105 shadow-blue-500/50' 
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-102 border-2 border-gray-200'
              }
            `}
          >
            {activeTab === 'issuer' && (
              <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-pulse"></div>
            )}
            <span className="relative z-10">Issuer</span>
          </button>
          
          <button
            onClick={() => setActiveTab('holder')}
            disabled={!account}
            className={`
              relative px-8 py-3 rounded-xl font-semibold text-white
              transition-all duration-300 transform
              ${!account ? 'opacity-50 cursor-not-allowed' : ''}
              ${activeTab === 'holder' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg scale-105 shadow-green-500/50' 
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-102 border-2 border-gray-200'
              }
            `}
          >
            {activeTab === 'holder' && (
              <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-pulse"></div>
            )}
            <span className="relative z-10">Holder</span>
          </button>
          
          <button
            onClick={() => setActiveTab('verifier')}
            disabled={!account}
            className={`
              relative px-8 py-3 rounded-xl font-semibold text-white
              transition-all duration-300 transform
              ${!account ? 'opacity-50 cursor-not-allowed' : ''}
              ${activeTab === 'verifier' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg scale-105 shadow-purple-500/50' 
                : 'bg-white text-gray-700 hover:shadow-md hover:scale-102 border-2 border-gray-200'
              }
            `}
          >
            {activeTab === 'verifier' && (
              <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-pulse"></div>
            )}
            <span className="relative z-10">Verifier</span>
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100 transition-all duration-500 hover:shadow-3xl">
          <div className="relative">
            {/* Decorative corner elements */}
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 blur-2xl"></div>
            
            {/* Tab Content */}
            <div className="relative z-10">
              {account ? (
                <>
                  {activeTab === 'issuer' && <IssuerTab contractAddress={CONTRACT_ADDRESS} abi={abi} />}
                  {activeTab === 'holder' && <HolderTab contractAddress={CONTRACT_ADDRESS} abi={abi} />}
                  {activeTab === 'verifier' && <VerifierTab contractAddress={CONTRACT_ADDRESS} abi={abi} />}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Wallet Connection Required</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your MetaMask wallet to access the e-KYC Vault features
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-500 font-mono bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            Contract: {CONTRACT_ADDRESS}
          </p>
          {account && (
            <p className="text-xs text-gray-400">
              Connected as: {account}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}