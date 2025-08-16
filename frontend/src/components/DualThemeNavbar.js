import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import WalletButton from './WalletButton';
import { MatchaIcon, MusicPerformanceIcon } from './Icons';
import './DualThemeNavbar.css';

const DualThemeNavbar = () => {
  const { role, address } = useWeb3();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMatcha = theme === 'matcha';

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className={`dual-theme-navbar ${isMatcha ? 'theme-matcha' : 'theme-performative'}`}>
      <div className="navbar-content">
        {/* Logo Section */}
        <Link to="/" className="logo-container">
          <div className="logo-icon">
            {isMatcha ? <MatchaIcon size={32} /> : <MusicPerformanceIcon size={32} />}
          </div>
          <h1 className="brand-title">
            Matcha
          </h1>
        </Link>

        {/* Theme Toggle - Center Position */}
        <div className="theme-toggle-container">
          <div className={`theme-toggle ${isMatcha ? 'theme-matcha' : 'theme-performative'}`}>
            {/* Background Slider */}
            <div 
              className={`toggle-slider ${isMatcha ? 'slide-left' : 'slide-right'}`}
            />
            
            {/* Match-a Button (Sports) */}
            <button
              onClick={() => {
                // Only allow switch to Match-a if user is fan or sports team
                if (!isMatcha && (role === 'fan' || role === 'sportsTeam')) {
                  toggleTheme();
                }
              }}
              className={`toggle-button ${isMatcha ? 'active' : ''} ${
                role !== 'fan' && role !== 'sportsTeam' ? 'disabled' : ''
              }`}
              disabled={role !== 'fan' && role !== 'sportsTeam'}
              title={role === 'musician' ? 'Musicians can only access the Performative side' : ''}
            >
              <span><MatchaIcon size={16} /> Match-a</span>
            </button>

            {/* Divider */}
            <div className="toggle-divider" />

            {/* Performative Button (Concerts) */}
            <button
              onClick={() => {
                // Only allow switch to Performative if user is fan or musician
                if (isMatcha && (role === 'fan' || role === 'musician')) {
                  toggleTheme();
                }
              }}
              className={`toggle-button ${!isMatcha ? 'active' : ''} ${
                role !== 'fan' && role !== 'musician' ? 'disabled' : ''
              }`}
              disabled={role !== 'fan' && role !== 'musician'}
              title={role === 'sportsTeam' ? 'Sports Teams can only access the Match-a side' : ''}
            >
              <span><MusicPerformanceIcon size={16} /> Performative</span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          {role && (
            <>
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                {isMatcha ? 'Browse Matches' : 'Browse Concerts'}
              </Link>
              {role === "fan" && (
                <Link to="/manage-tickets" className={`nav-link ${isActive('/manage-tickets')}`}>
                  Your {isMatcha ? 'Tickets' : 'Tickets'} & Profile
                </Link>
              )}
              {(role === "musician" || role === "sportsTeam") && (
                <Link to="/manage-concerts" className={`nav-link ${isActive('/manage-concerts')}`}>
                  Manage {isMatcha ? 'Matches' : 'Concerts'}
                </Link>
              )}
            </>
          )}
        </div>

        {/* Wallet Section */}
        <div className="wallet-section">
          {address && (
            <div className="user-role">
              <span className={`role-badge ${role} ${isMatcha ? 'matcha' : 'performative'}`}>
                {role === "musician" ? (isMatcha ? "Team Manager" : "Musician") : 
                 role === "sportsTeam" ? "Sports Team" : "Fan"}
              </span>
            </div>
          )}
          <WalletButton />
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`mobile-menu-button ${isMatcha ? 'matcha' : 'performative'}`}
        >
          <span className="hamburger-icon">☰</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`mobile-nav ${isMatcha ? 'theme-matcha' : 'theme-performative'}`}>
          <div className="mobile-nav-content">

            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isMatcha ? 'Browse Matches' : 'Browse Concerts'}
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
            {(role === "musician" || role === "sportsTeam") && (
              <Link 
                to="/manage-concerts" 
                className={`mobile-nav-link ${isActive('/manage-concerts')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Manage {isMatcha ? 'Matches' : 'Concerts'}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default DualThemeNavbar;
