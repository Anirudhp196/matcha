import React from 'react';
import { useFundWallet } from '@privy-io/react-auth';
import { useWeb3 } from '../contexts/Web3Context';
import { NETWORK_CONFIG } from '../contracts/config';
import './FundWalletButton.css';

const FundWalletButton = ({ className = "" }) => {
  const { fundWallet } = useFundWallet();
  const { address } = useWeb3();

  const handleFundWallet = () => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }

    fundWallet(address, {
      chain: NETWORK_CONFIG, // Use the correct Privy chain config
      // Optional: specify amount
      // amount: '10', // $10 USD equivalent
    });
  };

  return (
    <button 
      onClick={handleFundWallet}
      className={`fund-wallet-btn ${className}`}
      disabled={!address}
    >
      💳 Add Funds
    </button>
  );
};

export default FundWalletButton;
