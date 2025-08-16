import { useState, useCallback } from 'react';

// Backend API base URL - you can set this in .env file if needed
const API_BASE = process.env.REACT_APP_ENS_API_BASE || "http://localhost:4000";

const isEthAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address?.trim() || '');

export const useEns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Look up ENS name for an address
  const lookupName = useCallback(async (address) => {
    if (!isEthAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/ens-name/${address.trim()}`);
      
      if (!response.ok) {
        throw new Error(`ENS name lookup failed: ${response.status}`);
      }

      const data = await response.json();
      return data.ensName;
    } catch (err) {
      const errorMessage = err.message || "ENS name lookup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Look up full ENS profile for an address
  const lookupProfile = useCallback(async (address) => {
    if (!isEthAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/ens-profile/${address.trim()}`);
      
      if (!response.ok) {
        throw new Error(`ENS profile lookup failed: ${response.status}`);
      }

      const profileData = await response.json();
      
      // Transform backend response to frontend format
      return {
        address: profileData.address,
        ensName: profileData.name,
        avatar: profileData.avatar,
        records: {
          url: profileData.url,
          'com.twitter': profileData.twitter,
          'com.github': profileData.github,
          description: profileData.description,
          email: null // Backend doesn't include email yet
        }
      };
    } catch (err) {
      const errorMessage = err.message || "ENS profile lookup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Look up both name and profile in parallel
  const lookupComplete = useCallback(async (address) => {
    if (!isEthAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    setLoading(true);
    setError(null);

    try {
      const [nameRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/api/ens-name/${address.trim()}`),
        fetch(`${API_BASE}/api/ens-profile/${address.trim()}`)
      ]);

      if (!nameRes.ok) {
        throw new Error(`ENS name lookup failed: ${nameRes.status}`);
      }
      if (!profileRes.ok) {
        throw new Error(`ENS profile lookup failed: ${profileRes.status}`);
      }

      const nameData = await nameRes.json();
      const profileData = await profileRes.json();

      return {
        ensName: nameData.ensName,
        profile: {
          address: profileData.address,
          ensName: profileData.name,
          avatar: profileData.avatar,
          records: {
            url: profileData.url,
            'com.twitter': profileData.twitter,
            'com.github': profileData.github,
            description: profileData.description,
            email: null
          }
        }
      };
    } catch (err) {
      const errorMessage = err.message || "ENS lookup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility function to shorten Ethereum addresses
  const shortenAddress = useCallback((address) => {
    if (!address || typeof address !== 'string') return '';
    return address.slice(0, 6) + "..." + address.slice(-4);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    lookupName,
    lookupProfile,
    lookupComplete,
    shortenAddress,
    clearError,
    isEthAddress
  };
};

export default useEns;
