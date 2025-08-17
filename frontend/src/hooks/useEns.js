import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

const isEthAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address?.trim() || '');

export const useEns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider for ENS operations (using Ethereum mainnet for ENS)
  const provider = useMemo(() => {
    try {
      // Use a more reliable RPC endpoint
      return new ethers.providers.JsonRpcProvider('https://cloudflare-eth.com');
    } catch (err) {
      console.error('Failed to initialize ENS provider:', err);
      return null;
    }
  }, []);

  // Look up ENS name for an address
  const lookupName = useCallback(async (address) => {
    console.log("🔍 ENS lookupName called with address:", address);
    
    if (!isEthAddress(address)) {
      console.log("❌ Invalid Ethereum address:", address);
      throw new Error("Invalid Ethereum address");
    }

    if (!provider) {
      console.log("❌ ENS provider not available, skipping lookup");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🌐 Looking up ENS name for address:", address);
      const ensName = await provider.lookupAddress(address);
      console.log("✅ ENS lookup result:", ensName || "No ENS name found");
      return ensName;
    } catch (err) {
      console.log("❌ ENS lookup failed (network issue), continuing without ENS:", err.message);
      // Don't throw error, just return null to continue without ENS
      return null;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Look up address for an ENS name
  const lookupAddress = useCallback(async (ensName) => {
    if (!ensName || !ensName.includes('.eth')) {
      throw new Error("Invalid ENS name");
    }

    if (!provider) {
      console.log("ENS provider not available, skipping address lookup");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const address = await provider.resolveName(ensName);
      return address;
    } catch (err) {
      console.log("ENS address lookup failed, continuing without ENS:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Look up ENS profile (avatar, etc.) for an address
  const lookupProfile = useCallback(async (address) => {
    console.log("🔍 ENS lookupProfile called with address:", address);
    
    if (!isEthAddress(address)) {
      console.log("❌ Invalid Ethereum address:", address);
      throw new Error("Invalid Ethereum address");
    }

    if (!provider) {
      console.log("❌ ENS provider not available, skipping profile lookup");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🌐 Looking up ENS name for profile:", address);
      const ensName = await provider.lookupAddress(address);
      console.log("📛 ENS name found:", ensName || "No ENS name");
      
      if (!ensName) {
        return null;
      }

      // Get resolver to fetch profile data
      console.log("🔧 Getting resolver for:", ensName);
      const resolver = await provider.getResolver(ensName);
      if (!resolver) {
        console.log("❌ No resolver found for:", ensName);
        return { ensName };
      }

      // Fetch avatar and other profile data safely
      const profileData = { ensName };
      console.log("📊 Fetching profile data for:", ensName);
      
      try {
        console.log("🖼️ Fetching avatar...");
        profileData.avatar = await resolver.getAvatar();
        console.log("✅ Avatar found:", profileData.avatar || "No avatar");
      } catch (e) {
        console.log("❌ Avatar fetch failed:", e.message);
        profileData.avatar = null;
      }
      
      try {
        console.log("📝 Fetching description...");
        profileData.description = await resolver.getText('description');
        console.log("✅ Description found:", profileData.description || "No description");
      } catch (e) {
        console.log("❌ Description fetch failed:", e.message);
        profileData.description = null;
      }
      
      try {
        console.log("🔗 Fetching URL...");
        profileData.url = await resolver.getText('url');
        console.log("✅ URL found:", profileData.url || "No URL");
      } catch (e) {
        console.log("❌ URL fetch failed:", e.message);
        profileData.url = null;
      }

      console.log("🎯 Final profile data:", profileData);
      return profileData;
    } catch (err) {
      console.log("❌ ENS profile lookup failed, continuing without ENS:", err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Check ENS name availability
  const checkAvailability = useCallback(async (ensName) => {
    if (!ensName) {
      throw new Error("ENS name is required");
    }

    const cleanName = ensName.toLowerCase().replace(/\.eth$/, '');
    
    if (cleanName.length < 3) {
      throw new Error("Name must be at least 3 characters long");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Checking availability for: ${cleanName}.eth`);
      const address = await provider.resolveName(`${cleanName}.eth`);
      console.log(`📍 Resolution result:`, address);
      
      // If address exists, the name is TAKEN (not available)
      // If address is null, the name is AVAILABLE
      const isAvailable = address === null;
      console.log(`✅ ${cleanName}.eth is ${isAvailable ? 'AVAILABLE' : 'TAKEN'}`);
      return isAvailable;
    } catch (err) {
      console.log(`❌ ENS resolution error for ${cleanName}.eth:`, err.message);
      // If there's a network error, we can't determine availability
      // It's safer to return false (assume taken) to avoid false positives
      console.log(`⚠️ Assuming ${cleanName}.eth is taken due to resolution error`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // Get registration cost estimate
  const getRegistrationCost = useCallback(async (ensName, years = 1) => {
    if (!ensName) {
      throw new Error("ENS name is required");
    }

    const cleanName = ensName.toLowerCase().replace(/\.eth$/, '');

    // Estimated pricing based on ENS app pricing
    let basePrice;
    if (cleanName.length >= 5) {
      basePrice = "0.005"; // ~$5/year for 5+ character names
    } else if (cleanName.length === 4) {
      basePrice = "0.02"; // ~$20/year for 4 character names
    } else {
      basePrice = "0.05"; // ~$50/year for 3 character names
    }
    
    const totalPrice = (parseFloat(basePrice) * years).toString();
    return ethers.utils.parseEther(totalPrice);
  }, []);

  // Register ENS name by redirecting to official ENS app
  const registerName = useCallback(async (ensName, signer, years = 1) => {
    if (!ensName) {
      throw new Error("ENS name is required");
    }

    const cleanName = ensName.toLowerCase().replace(/\.eth$/, '');

    // Open the official ENS app for registration
    const ensUrl = `https://app.ens.domains/register/${cleanName}`;
    window.open(ensUrl, '_blank', 'noopener,noreferrer');
    
    // Return a mock transaction for compatibility with existing UI
    return {
      hash: 'redirect_to_ens_app',
      wait: async () => ({ 
        status: 1,
        transactionHash: 'redirect_to_ens_app'
      })
    };
  }, []);

  // Utility function to shorten address
  const shortenAddress = useCallback((address) => {
    if (!isEthAddress(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Test function to verify ENS is working with known address
  const testEnsLookup = useCallback(async () => {
    const testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth
    console.log("🧪 Testing ENS lookup with vitalik.eth address:", testAddress);
    try {
      const profile = await lookupProfile(testAddress);
      console.log("🧪 Test result:", profile);
      return profile;
    } catch (err) {
      console.log("🧪 Test failed:", err);
      return null;
    }
  }, [lookupProfile]);

  // Test function specifically for user's address with detailed debugging
  const debugUserEns = useCallback(async (userAddress) => {
    console.log("🔬 DEBUGGING USER ENS for address:", userAddress);
    
    if (!provider) {
      console.log("❌ No ENS provider available");
      return null;
    }

    try {
      // Try direct lookupAddress call
      console.log("🔍 Step 1: Direct lookupAddress call...");
      const ensName = await provider.lookupAddress(userAddress);
      console.log("📛 Direct lookup result:", ensName || "No ENS name found");

      if (ensName) {
        console.log("✅ ENS name found! Fetching full profile...");
        
        // Get resolver
        console.log("🔧 Step 2: Getting resolver...");
        const resolver = await provider.getResolver(ensName);
        console.log("🔧 Resolver:", resolver ? "Found" : "Not found");

        if (resolver) {
          // Try to get avatar specifically
          console.log("🖼️ Step 3: Getting avatar...");
          try {
            const avatar = await resolver.getAvatar();
            console.log("🖼️ Avatar result:", avatar || "No avatar");
            
            return {
              ensName,
              avatar,
              debug: "SUCCESS - ENS found and avatar fetched"
            };
          } catch (avatarErr) {
            console.log("❌ Avatar fetch error:", avatarErr.message);
            return {
              ensName,
              avatar: null,
              debug: "ENS found but avatar failed"
            };
          }
        } else {
          return {
            ensName,
            avatar: null,
            debug: "ENS found but no resolver"
          };
        }
      } else {
        console.log("❌ No ENS name found for this address");
        
        // Additional debugging - check if address is valid
        console.log("🔍 Address validation:");
        console.log("- Address:", userAddress);
        console.log("- Length:", userAddress.length);
        console.log("- Starts with 0x:", userAddress.startsWith('0x'));
        console.log("- Is valid format:", /^0x[a-fA-F0-9]{40}$/.test(userAddress));
        
        return {
          ensName: null,
          avatar: null,
          debug: "No ENS name found - address might not have ENS or reverse record not set"
        };
      }
    } catch (err) {
      console.log("❌ ENS debug error:", err.message);
      console.log("❌ Full error:", err);
      return {
        ensName: null,
        avatar: null,
        debug: `Error: ${err.message}`
      };
    }
  }, [provider]);

  return {
    loading,
    error,
    lookupName,
    lookupAddress,
    lookupProfile,
    checkAvailability,
    getRegistrationCost,
    registerName, // Redirects to official ENS app
    shortenAddress,
    clearError,
    isEthAddress,
    testEnsLookup, // Test function
    debugUserEns, // Debug function for user's specific address
    ensInitialized: true // Always true since we use ethers directly
  };
};

export default useEns;