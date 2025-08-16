import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useTheme } from "../contexts/ThemeContext";
import { useEns } from "../hooks/useEns";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-hot-toast";
import "./EnsRegistration.css";

// ENS contract addresses on mainnet
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const ENS_REGISTRAR_ADDRESS = "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5";
const ENS_RESOLVER_ADDRESS = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41";

const EnsRegistration = ({ address, signer, onRegistrationComplete, onSkip }) => {
  const { theme } = useTheme();
  const { checkAvailability, getRegistrationCost, loading: ensLoading, error: ensError } = useEns();
  const [desiredName, setDesiredName] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState("input"); // input, commit, reveal, complete
  const [commitHash, setCommitHash] = useState(null);
  const [secret, setSecret] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [duration, setDuration] = useState(1); // years

  // Generate a random secret for the commit-reveal scheme
  useEffect(() => {
    setSecret(ethers.utils.randomBytes(32));
  }, []);

  const checkNameAvailability = async () => {
    if (!desiredName || desiredName.length < 3) {
      toast.error("Name must be at least 3 characters long");
      return;
    }

    setIsChecking(true);
    try {
      // Remove .eth if user added it
      const cleanName = desiredName.toLowerCase().replace(/\.eth$/, "");
      
      // Check availability using our backend API
      const available = await checkAvailability(cleanName);
      setIsAvailable(available);

      if (available) {
        try {
          // Get the cost for registration
          const cost = await getRegistrationCost(cleanName, duration);
          if (cost) {
            setEstimatedCost(ethers.BigNumber.from(cost));
          }
          toast.success(`${cleanName}.eth is available!`);
        } catch (costError) {
          console.error("Error getting cost:", costError);
          // Still show as available even if cost lookup fails
          toast.success(`${cleanName}.eth is available!`);
        }
      } else {
        toast.error(`${cleanName}.eth is not available`);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast.error("Failed to check availability");
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const startRegistration = async () => {
    if (!isAvailable || !desiredName) return;

    setIsRegistering(true);
    setRegistrationStep("commit");

    try {
      const cleanName = desiredName.toLowerCase().replace(/\.eth$/, "");
      const provider = signer.provider;
      
      const registrarContract = new ethers.Contract(
        ENS_REGISTRAR_ADDRESS,
        [
          "function makeCommitment(string calldata name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] calldata data, bool reverseRecord, uint32 fuses, uint64 wrapperExpiry) external pure returns (bytes32)",
          "function commit(bytes32 commitment) external",
          "function register(string calldata name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] calldata data, bool reverseRecord, uint32 fuses, uint64 wrapperExpiry) external payable"
        ],
        signer
      );

      // Step 1: Make commitment
      const commitment = await registrarContract.makeCommitment(
        cleanName,
        address,
        duration * 365 * 24 * 60 * 60, // duration in seconds
        secret,
        ENS_RESOLVER_ADDRESS,
        [], // no additional data
        true, // set reverse record
        0, // no fuses
        0 // no wrapper expiry
      );

      setCommitHash(commitment);

      // Step 2: Commit
      toast.info("Step 1: Submitting commitment...");
      const commitTx = await registrarContract.commit(commitment);
      await commitTx.wait();

      toast.success("Commitment submitted! Waiting 60 seconds before registration...");
      setRegistrationStep("waiting");

      // Wait for the minimum commit age (60 seconds)
      setTimeout(async () => {
        try {
          setRegistrationStep("reveal");
          toast.info("Step 2: Registering your ENS name...");

          // Step 3: Register
          const registerTx = await registrarContract.register(
            cleanName,
            address,
            duration * 365 * 24 * 60 * 60,
            secret,
            ENS_RESOLVER_ADDRESS,
            [],
            true,
            0,
            0,
            {
              value: estimatedCost
            }
          );

          await registerTx.wait();
          
          setRegistrationStep("complete");
          toast.success(`Successfully registered ${cleanName}.eth!`);
          
          // Wait a moment then complete
          setTimeout(() => {
            onRegistrationComplete(`${cleanName}.eth`);
          }, 2000);

        } catch (error) {
          console.error("Registration failed:", error);
          toast.error("Registration failed: " + (error.reason || error.message));
          setIsRegistering(false);
          setRegistrationStep("input");
        }
      }, 61000); // 61 seconds to be safe

    } catch (error) {
      console.error("Commitment failed:", error);
      toast.error("Failed to start registration: " + (error.reason || error.message));
      setIsRegistering(false);
      setRegistrationStep("input");
    }
  };

  const formatEth = (wei) => {
    if (!wei) return "0";
    return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
  };

  const renderStep = () => {
    switch (registrationStep) {
      case "input":
        return (
          <div className="ens-registration-form">
            <div className="ens-input-section">
              <div className="ens-name-input-group">
                <input
                  type="text"
                  className="ens-name-input"
                  placeholder="myname"
                  value={desiredName}
                  onChange={(e) => setDesiredName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  onKeyPress={(e) => e.key === 'Enter' && checkNameAvailability()}
                />
                <span className="ens-suffix">.eth</span>
              </div>
              
              <div className="ens-duration-select">
                <label>Registration Duration:</label>
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="duration-select"
                >
                  <option value={1}>1 year</option>
                  <option value={2}>2 years</option>
                  <option value={3}>3 years</option>
                  <option value={5}>5 years</option>
                </select>
              </div>

              <button
                className="ens-check-button theme-button primary"
                onClick={checkNameAvailability}
                disabled={isChecking || !desiredName || desiredName.length < 3}
              >
                {isChecking ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Checking...</span>
                  </>
                ) : (
                  "Check Availability"
                )}
              </button>
            </div>

            {isAvailable === true && estimatedCost && (
              <div className="ens-availability-result success">
                <div className="availability-header">
                  <span className="check-icon">✅</span>
                  <h3>{desiredName}.eth is available!</h3>
                </div>
                <div className="cost-info">
                  <p>Registration cost: <strong>{formatEth(estimatedCost)} ETH</strong></p>
                  <p className="cost-note">Plus gas fees for transactions</p>
                </div>
                <button
                  className="ens-register-button theme-button primary"
                  onClick={startRegistration}
                  disabled={isRegistering}
                >
                  Register Now
                </button>
              </div>
            )}

            {isAvailable === false && (
              <div className="ens-availability-result error">
                <span className="error-icon">❌</span>
                <p>{desiredName}.eth is not available</p>
                <p className="suggestion">Try a different name</p>
              </div>
            )}
          </div>
        );

      case "commit":
        return (
          <div className="ens-registration-progress">
            <div className="progress-header">
              <LoadingSpinner size="medium" />
              <h3>Starting Registration Process</h3>
            </div>
            <p>Submitting commitment for {desiredName}.eth...</p>
            <div className="progress-note">
              <p>This is step 1 of 2. A commitment prevents others from registering your name during the process.</p>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div className="ens-registration-progress">
            <div className="progress-header">
              <div className="countdown-spinner">⏳</div>
              <h3>Waiting Period</h3>
            </div>
            <p>Commitment submitted! Waiting for security period...</p>
            <div className="progress-note">
              <p>ENS requires a 60-second waiting period between commitment and registration for security.</p>
              <p>Your name <strong>{desiredName}.eth</strong> is protected during this time.</p>
            </div>
          </div>
        );

      case "reveal":
        return (
          <div className="ens-registration-progress">
            <div className="progress-header">
              <LoadingSpinner size="medium" />
              <h3>Finalizing Registration</h3>
            </div>
            <p>Registering {desiredName}.eth...</p>
            <div className="progress-note">
              <p>This is the final step. Once confirmed, you'll own {desiredName}.eth!</p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="ens-registration-complete">
            <div className="success-header">
              <span className="success-icon">🎉</span>
              <h3>Registration Complete!</h3>
            </div>
            <p>You now own <strong>{desiredName}.eth</strong></p>
            <div className="complete-note">
              <p>Your ENS name is now linked to your wallet and will be used throughout the platform.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`ens-registration-overlay theme-${theme}`}>
      <div className="ens-registration-container">
        <div className="ens-registration-header">
          <h2>Create Your ENS Name</h2>
          <p>An ENS name makes it easy for others to find and recognize you. Instead of a long wallet address, you'll have a memorable name like yourname.eth</p>
        </div>

        <div className="ens-registration-content">
          {renderStep()}
        </div>

        {registrationStep === "input" && (
          <div className="ens-registration-footer">
            <button 
              className="ens-skip-button theme-button secondary"
              onClick={onSkip}
              disabled={isRegistering}
            >
              Skip for now
            </button>
            <div className="ens-help-text">
              <p>You can always register an ENS name later in your profile settings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnsRegistration;
