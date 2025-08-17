import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "./LoadingSpinner";
import { MatchaIcon } from "./Icons";
import "./FundingOptions.css";

const FundingOptions = ({ address, onFundingComplete, onSkip }) => {
  const { theme } = useTheme();
  const { user } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10); // Default $10

  const isMatcha = theme === 'matcha';

  // Get the login method that was used
  const getLoginMethod = () => {
    if (!user?.linkedAccounts) return 'unknown';
    
    const accounts = user.linkedAccounts;
    if (accounts.some(acc => acc.type === 'google_oauth')) return 'google';
    if (accounts.some(acc => acc.type === 'twitter_oauth')) return 'twitter';
    if (accounts.some(acc => acc.type === 'discord_oauth')) return 'discord';
    if (accounts.some(acc => acc.type === 'github_oauth')) return 'github';
    if (accounts.some(acc => acc.type === 'email')) return 'email';
    if (accounts.some(acc => acc.type === 'wallet')) return 'wallet';
    
    return 'social';
  };

  const loginMethod = getLoginMethod();

  const handleFundWallet = async (method) => {
    setLoading(true);
    try {
      switch (method) {
        case 'privy-onramp':
          // Use Privy's built-in on-ramp
          console.log("🏦 Opening Privy on-ramp...");
          // Note: You'll need to configure this based on your Privy setup
          window.open(`https://app.privy.io/fund?address=${address}&amount=${selectedAmount}`, '_blank');
          break;
          
        case 'moonpay':
          // Direct MoonPay integration
          const moonpayUrl = `https://buy.moonpay.com?apiKey=YOUR_MOONPAY_KEY&currencyCode=ETH&walletAddress=${address}&baseCurrencyAmount=${selectedAmount}`;
          window.open(moonpayUrl, '_blank');
          break;
          
        case 'ramp':
          // Ramp Network integration
          const rampUrl = `https://buy.ramp.network/?hostApiKey=YOUR_RAMP_KEY&userAddress=${address}&defaultAsset=ETH&fiatValue=${selectedAmount}`;
          window.open(rampUrl, '_blank');
          break;
          
        case 'faucet':
          // For testnet, we can provide faucet links
          window.open('https://testnet.evm.nodes.onflow.org/faucet', '_blank');
          break;
          
        case 'transfer-exchange':
          console.log("Instructions for transferring from exchange will be displayed here.");
          alert("Please transfer ETH/FLOW from your exchange to your wallet address: " + address);
          break;
          
        case 'transfer-external-wallet':
          console.log("Instructions for transferring from external wallet will be displayed here.");
          alert("Please transfer ETH/FLOW from your external wallet to your wallet address: " + address);
          break;
          
        default:
          console.log("Unknown funding method");
      }
      
      // Show success message and allow user to continue
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Funding failed:", error);
      setLoading(false);
    }
  };

  const fundingAmounts = [5, 10, 25, 50, 100];

  return (
    <div className={`funding-overlay ${theme}`}>
      <div className="funding-container">
        <div className="funding-header">
          <MatchaIcon size={48} />
          <h2>💰 Fund Your Wallet</h2>
          <p>You'll need some tokens to interact with {isMatcha ? 'Matcha' : 'concerts'}</p>
          <div className="login-info">
            <p>✨ Logged in via <strong>{loginMethod}</strong></p>
            <p className="address-info">📱 Wallet: <code>{address?.slice(0, 6)}...{address?.slice(-4)}</code></p>
          </div>
        </div>

        <div className="funding-content">
          <div className="why-funding">
            <h3>Why do I need tokens?</h3>
            <ul>
              <li>🎫 <strong>Buy concert tickets</strong></li>
              <li>🎤 <strong>Create events</strong> (as musician)</li>
              <li>⛽ <strong>Pay for transaction fees</strong></li>
              <li>🔄 <strong>Trade on marketplace</strong></li>
            </ul>
          </div>

          <div className="amount-selection">
            <h4>Select amount to fund:</h4>
            <div className="amount-buttons">
              {fundingAmounts.map(amount => (
                <button
                  key={amount}
                  className={`amount-button ${selectedAmount === amount ? 'selected' : ''}`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="funding-methods">
            <h4>Choose funding method:</h4>
            
            <div className="funding-grid">
              <button
                className="funding-method-card primary"
                onClick={() => handleFundWallet('transfer-exchange')}
                disabled={loading}
              >
                <div className="method-icon">↔️</div>
                <div className="method-info">
                  <h5>Transfer from Exchange</h5>
                  <p>Deposit crypto from an exchange</p>
                  <span className="method-badge">RECOMMENDED</span>
                </div>
              </button>
              
              <button
                className="funding-method-card"
                onClick={() => handleFundWallet('transfer-external-wallet')}
                disabled={loading}
              >
                <div className="method-icon">📤</div>
                <div className="method-info">
                  <h5>Transfer from External Wallet</h5>
                  <p>Send from MetaMask, Rainbow, etc.</p>
                  <span className="method-badge">DIRECT</span>
                </div>
              </button>
            </div>
          </div>

          <div className="funding-actions">
            <button 
              onClick={onFundingComplete}
              className="continue-button primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Processing...</span>
                </>
              ) : (
                "I've funded my wallet"
              )}
            </button>
            
            <button 
              onClick={onSkip}
              className="skip-button secondary"
            >
              Skip for now
            </button>
          </div>

          <div className="funding-notes">
            <div className="note-card">
              <h5>💡 Pro Tips:</h5>
              <ul>
                <li>Start with $10-25 for testing</li>
                <li>Testnet tokens are free but only for testing</li>
                <li>You can always add more funds later</li>
                <li>Gas fees are usually under $1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingOptions;
