import React from "react";
import { useWeb3 } from "../contexts/Web3Context";
import LoadingSpinner from "./LoadingSpinner";
import "./WalletButton.css";

const shorten = (addr) => addr.slice(0, 6) + "..." + addr.slice(-4);

const WalletButton = () => {
  const {
    address,
    connectWallet,
    disconnectWallet,
    isConnected,
    isConnecting,
    user, // Privy user info
  } = useWeb3();

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
          <span className="wallet-address">
            {user?.email?.address || shorten(address)}
          </span>
          <button className="disconnect-button" onClick={disconnectWallet}>
            ✖ Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
