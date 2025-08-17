import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export const useRoleSponsorship = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sponsorRoleRegistration = useCallback(async (role, signer, userAddress) => {
    if (!signer || !userAddress) {
      throw new Error('Signer and user address required');
    }

    if (!['fan', 'musician'].includes(role)) {
      throw new Error('Invalid role');
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🎯 Starting sponsored role registration for:", { role, userAddress });

      // Create the message to sign
      const message = role === 'fan' ? 'registerAsFan' : 'registerAsMusician';
      const messageHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['string', 'address'], [message, userAddress])
      );

      console.log("📝 Message to sign:", message);
      console.log("🔐 Message hash:", messageHash);

      // Sign the message
      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));
      console.log("✍️ Signature:", signature);

      // Split signature into v, r, s components
      const sig = ethers.utils.splitSignature(signature);
      console.log("📋 Signature components:", sig);

      // Send to relay service
      const response = await fetch('http://localhost:3001/api/sponsor-role-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          role,
          signature: {
            v: sig.v,
            r: sig.r,
            s: sig.s
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      console.log("✅ Registration successful:", result);

      return {
        success: true,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      };

    } catch (err) {
      console.error("❌ Sponsored registration failed:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkRelayerHealth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      return await response.json();
    } catch (err) {
      console.error("❌ Relay health check failed:", err);
      return null;
    }
  }, []);

  const getRelayerBalance = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/relayer-balance');
      return await response.json();
    } catch (err) {
      console.error("❌ Relay balance check failed:", err);
      return null;
    }
  }, []);

  return {
    sponsorRoleRegistration,
    checkRelayerHealth,
    getRelayerBalance,
    loading,
    error
  };
};
