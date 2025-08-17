import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useEns } from "../hooks/useEns";
import LoadingSpinner from "./LoadingSpinner";
import "./EnsLookup.css";

const EnsLookup = () => {
  const { theme } = useTheme();
  const [address, setAddress] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const { loading, error, lookupName, lookupProfile, isEthAddress, shortenAddress, clearError } = useEns();

  const lookup = async () => {
    // Clear previous results
    setEnsName(null);
    setProfile(null);
    clearError();

    const addr = address.trim();
    if (!isEthAddress(addr)) {
      return;
    }

    try {
      const ensName = await lookupName(addr);
      setEnsName(ensName);
      
      if (ensName) {
        const profile = await lookupProfile(addr);
        setProfile(profile);
      }
    } catch (e) {
      // Error is handled by the hook
      console.error('ENS lookup failed:', e);
    }
  };

  const getRecord = (key) => profile?.records?.[key] ?? null;

  return (
    <div className={`ens-lookup-container theme-${theme}`}>
      <div className="ens-lookup-content">
        <h1 className="ens-title">ENS Lookup</h1>
        <p className="ens-subtitle">Look up Ethereum Name Service profiles</p>

        <div className="ens-search-section">
          <div className="ens-input-group">
            <input
              className="ens-input"
              placeholder="0x1234..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && lookup()}
            />
            <button
              className="ens-lookup-button theme-button primary"
              onClick={lookup}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Looking...</span>
                </>
              ) : (
                "🔍 Lookup"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="ens-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {(ensName || profile) && (
          <div className="ens-result-card theme-card">
            <div className="ens-profile-header">
              <div className="ens-avatar-container">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="ENS avatar"
                    className="ens-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`ens-avatar-placeholder ${profile?.avatar ? 'hidden' : ''}`}
                  style={profile?.avatar ? {display: 'none'} : {}}
                >
                  👤
                </div>
              </div>
              <div className="ens-profile-info">
                <div className="ens-name">
                  {ensName || "(no ENS name)"}
                </div>
                <div className="ens-address">
                  {shortenAddress(profile?.address)}
                </div>
              </div>
            </div>

            <div className="ens-records-grid">
              {getRecord("url") && (
                <div className="ens-record">
                  <span className="record-label">🌐 Website:</span>
                  <a 
                    className="record-link" 
                    href={getRecord("url")} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {getRecord("url")}
                  </a>
                </div>
              )}
              
              {getRecord("com.twitter") && (
                <div className="ens-record">
                  <span className="record-label">🐦 Twitter:</span>
                  <span className="record-value">@{getRecord("com.twitter")}</span>
                </div>
              )}
              
              {getRecord("com.github") && (
                <div className="ens-record">
                  <span className="record-label">💻 GitHub:</span>
                  <span className="record-value">{getRecord("com.github")}</span>
                </div>
              )}
              
              {getRecord("description") && (
                <div className="ens-record description">
                  <span className="record-label">📝 Bio:</span>
                  <span className="record-value">{getRecord("description")}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnsLookup;
