import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import WalletButton from './WalletButton';
import { MusicPerformanceIcon } from './Icons';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { address, role, forceRoleSelection } = useWeb3();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="brand">
          <Link to="/" className="brand-link">
            <MusicPerformanceIcon size={24} />
            <span className="brand-text">Matcha</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="nav-menu">
          {address && (
            <>
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                Browse Concerts
              </Link>
              {role === "fan" && (
                <Link to="/manage-tickets" className={`nav-link ${isActive('/manage-tickets')}`}>
                  Your Tickets & Profile
                </Link>
              )}
              {role === "musician" && (
                <Link to="/manage-concerts" className={`nav-link ${isActive('/manage-concerts')}`}>
                  Manage Concerts
                </Link>
              )}
            </>
          )}
        </div>

        {/* Debug Section - TEMPORARY */}
        {address && (
          <button 
            onClick={forceRoleSelection}
            style={{
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              fontSize: '12px'
            }}
          >
            Change Role ({role || 'none'})
          </button>
        )}

        {/* Wallet Section */}
        <div className="wallet-section">
          {address && role && (
            <div className="user-role">
              <span className={`role-badge ${role}`}>
                {role === "musician" ? "Musician" : "Fan"}
              </span>
            </div>
          )}
          <WalletButton />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="mobile-menu-button"
        >
          <span className="hamburger-icon">☰</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Concerts
            </Link>
            {role === "fan" && (
              <Link 
                to="/manage-tickets" 
                className={`mobile-nav-link ${isActive('/manage-tickets')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Your Tickets
              </Link>
            )}
            {role === "musician" && (
              <Link 
                to="/manage-concerts" 
                className={`mobile-nav-link ${isActive('/manage-concerts')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Concerts
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;