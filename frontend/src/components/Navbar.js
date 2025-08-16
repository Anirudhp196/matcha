import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import WalletButton from "./WalletButton";
import "./Navbar.css";

const Navbar = () => {
  const { role, address } = useWeb3();
  const location = useLocation();

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="logo-container">
          <div className="logo-icon">🎧</div>
          <h1 className="mosh-title">Mosh</h1>
        </Link>

        <nav className="navbar-links">
          {role && (
            <>
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                Browse Events
              </Link>
              {role === "fan" && (
                <Link to="/manage-tickets" className={`nav-link ${isActive('/manage-tickets')}`}>
                  Your Tickets
                </Link>
              )}
              {role === "musician" && (
                <Link to="/manage-concerts" className={`nav-link ${isActive('/manage-concerts')}`}>
                  Manage Concerts
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="wallet-section">
          {address && (
            <div className="user-role">
              <span className={`role-badge ${role}`}>{role === "musician" ? "Musician" : "Fan"}</span>
            </div>
          )}
          <WalletButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
