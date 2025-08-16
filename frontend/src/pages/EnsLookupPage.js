import React from 'react';
import EnsLookup from '../components/EnsLookup';
import { useTheme } from '../contexts/ThemeContext';
import './EnsLookupPage.css';

const EnsLookupPage = () => {
  const { theme } = useTheme();
  const isMatcha = theme === 'matcha';

  return (
    <div className={`ens-page theme-${theme}`}>
      <div className="ens-page-header">
        <div className="ens-page-hero">
          <h1 className="ens-hero-title">
            {isMatcha ? '⚽ Player Lookup' : '🎧 Artist Lookup'}
          </h1>
          <p className="ens-hero-subtitle">
            {isMatcha 
              ? 'Find player profiles and stats using Ethereum addresses' 
              : 'Discover artist profiles and social links via ENS'
            }
          </p>
        </div>
      </div>
      
      <div className="ens-page-content">
        <EnsLookup />
      </div>
      
      <div className="ens-page-info">
        <div className="info-cards">
          <div className="info-card theme-card">
            <h3 className="info-title">🔍 What is ENS?</h3>
            <p className="info-text">
              Ethereum Name Service (ENS) allows you to have human-readable names 
              for your Ethereum addresses, like "alice.eth" instead of "0x123...".
            </p>
          </div>
          
          <div className="info-card theme-card">
            <h3 className="info-title">📋 How to use</h3>
            <p className="info-text">
              Enter any Ethereum address (starting with 0x) to see if they have 
              an ENS name and profile with social links, avatar, and bio.
            </p>
          </div>
          
          <div className="info-card theme-card">
            <h3 className="info-title">🎯 Why it matters</h3>
            <p className="info-text">
              {isMatcha 
                ? 'Connect with team members and verify player identities in the sports ecosystem.'
                : 'Discover and connect with artists, verify their identity, and explore their work.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnsLookupPage;
