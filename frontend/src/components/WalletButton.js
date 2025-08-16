import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useEns } from "../hooks/useEns";
import LoadingSpinner from "./LoadingSpinner";
import "./WalletButton.css";

const WalletButton = () => {
  const {
    address,
    connectWallet,
    disconnectWallet,
    isConnected,
    isConnecting,
    user, // Privy user info
    ensName,
    ensAvatar,
    getDisplayName,
  } = useWeb3();

  const { shortenAddress } = useEns();

  return (
    <div className="wallet-button-container">
      {!isConnected ? (
        <button
          className="connect-button"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <LoadingSpinner size="small" />
              <span className="connect-text">Connecting...</span>
            </>
          ) : (
            "🔐 Connect Wallet"
          )}
        </button>
      ) : (
        <div className="connected-info">
          {ensAvatar && (
            <img 
              src={ensAvatar} 
              alt="ENS Avatar" 
              className="ens-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <span className="wallet-address">
            {getDisplayName()}
          </span>
          {ensName && (
            <span className="ens-indicator" title={`ENS: ${ensName} | Address: ${shortenAddress(address)}`}>
              🔗
            </span>
          )}
          <button className="disconnect-button" onClick={disconnectWallet}>
            ✖ Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
