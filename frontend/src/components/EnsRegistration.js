import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useEns } from "../hooks/useEns";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import "./EnsRegistration.css";

const EnsRegistration = ({ address, signer, onRegistrationComplete, onSkip }) => {
  const { theme } = useTheme();
  const { 
    checkAvailability, 
    getRegistrationCost, 
    loading: ensLoading, 
    error: ensError,
    ensInitialized 
  } = useEns();
  
  const [desiredName, setDesiredName] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [duration, setDuration] = useState(1); // years

  const checkNameAvailability = async () => {
    if (!desiredName || desiredName.length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    if (!ensInitialized) {
      toast.error("ENS not initialized");
      return;
    }

    setIsChecking(true);
    setIsAvailable(null);
    setEstimatedCost(null);

    try {
      const cleanName = desiredName.toLowerCase().replace(/\.eth$/, "");
      
      // Check availability
      const available = await checkAvailability(cleanName);
      setIsAvailable(available);

      if (available) {
        // Get cost estimate
        try {
          const cost = await getRegistrationCost(cleanName, duration);
          setEstimatedCost(cost);
          toast.success(`${cleanName}.eth is available!`);
        } catch (costError) {
          console.error("Error getting cost:", costError);
          toast.success(`${cleanName}.eth is available!`);
        }
      } else {
        toast.error(`${cleanName}.eth is not available`);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability");
    } finally {
      setIsChecking(false);
    }
  };

  const openEnsApp = () => {
    if (!isAvailable || !desiredName) {
      toast.error("Please check name availability first");
      return;
    }

    const cleanName = desiredName.toLowerCase().replace(/\.eth$/, "");
    const ensUrl = `https://app.ens.domains/register/${cleanName}`;
    
    toast.loading("Opening ENS app in new tab...", { duration: 2000 });
    window.open(ensUrl, '_blank', 'noopener,noreferrer');
    
    // Show completion message and allow user to continue
    setTimeout(() => {
      toast.success("Complete your registration in the ENS app, then come back!");
    }, 1000);
  };

  const formatEthPrice = (wei) => {
    if (!wei) return "...";
    try {
      return `${parseFloat(ethers.utils.formatEther(wei)).toFixed(4)} ETH`;
    } catch {
      return "~0.01 ETH";
    }
  };

  if (!ensInitialized) {
    return (
      <div className="ens-registration-container">
        <div className="ens-registration-error">
          <h2>⚠️ ENS Not Available</h2>
          <p>Unable to initialize ENS service. Please try again later.</p>
          <button onClick={onSkip} className="skip-button">
            Continue without ENS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ens-registration-overlay ${theme}`}>
      <div className="ens-registration-container">
        <div className="ens-registration-header">
          <h2>🏷️ Register Your ENS Name</h2>
          <p>Get a human-readable name for your wallet address</p>
          <div className="ens-info">
            <p><strong>Note:</strong> Registration will open in the official ENS app for security and reliability.</p>
          </div>
        </div>

        <div className="ens-registration-form">
          <div className="name-input-section">
            <label htmlFor="ensName">Choose your ENS name:</label>
            <div className="name-input-wrapper">
              <input
                id="ensName"
                type="text"
                value={desiredName}
                onChange={(e) => setDesiredName(e.target.value)}
                placeholder="yourname"
                disabled={isChecking}
              />
              <span className="eth-suffix">.eth</span>
            </div>
          </div>

          <div className="duration-section">
            <label htmlFor="duration">Registration duration:</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={isChecking}
            >
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
              <option value={5}>5 years</option>
            </select>
          </div>

          <button
            onClick={checkNameAvailability}
            disabled={!desiredName || isChecking}
            className="check-button"
          >
            {isChecking ? (
              <>
                <LoadingSpinner size="small" />
                Checking...
              </>
            ) : (
              "Check Availability"
            )}
          </button>

          {isAvailable === true && (
            <div className="availability-result success">
              <h3>✅ Available!</h3>
              <p><strong>{desiredName}.eth</strong> is available for registration</p>
              {estimatedCost && (
                <p className="cost-estimate">
                  Estimated cost: <strong>{formatEthPrice(estimatedCost)}</strong> 
                  <span className="cost-note">(for {duration} year{duration > 1 ? 's' : ''})</span>
                </p>
              )}
              <div className="registration-options">
                <button
                  onClick={openEnsApp}
                  className="register-button primary"
                >
                  🔗 Register on ENS App
                </button>
                <p className="registration-note">
                  This will open the official ENS app where you can securely complete your registration.
                </p>
              </div>
            </div>
          )}

          {isAvailable === false && (
            <div className="availability-result error">
              <h3>❌ Not Available</h3>
              <p><strong>{desiredName}.eth</strong> is already taken</p>
              <p>Try a different name or check variations</p>
            </div>
          )}

          <div className="ens-registration-actions">
            <button onClick={onSkip} className="skip-button">
              Continue without ENS
            </button>
            <button 
              onClick={() => onRegistrationComplete(null)} 
              className="skip-button secondary"
            >
              I already have an ENS name
            </button>
          </div>

          <div className="ens-benefits">
            <h4>Why register an ENS name?</h4>
            <ul>
              <li>🎯 Easy to remember and share (yourname.eth)</li>
              <li>🔗 Works across all Web3 apps</li>
              <li>🌐 Can set avatar, social links, and more</li>
              <li>💎 Permanent ownership (renewable)</li>
            </ul>
          </div>
        </div>

        {ensError && (
          <div className="ens-error">
            <p>Error: {ensError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnsRegistration;