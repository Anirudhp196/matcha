const { ethers } = require("ethers");
require("dotenv").config();

// Default to mainnet for ENS resolution, can be parameterized if needed
const provider = new ethers.JsonRpcProvider(process.env.ENS_RPC_URL || "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY);

/**
 * Resolves the ENS name for a given Ethereum address, and verifies it resolves back to the address.
 * @param {string} address - The Ethereum address to look up.
 * @returns {Promise<string|null>} - The ENS name if valid, or null if not set or not valid.
 */
async function getENSName(address) {
  try {
    const name = await provider.lookupAddress(address);
    if (!name) return null;
    const resolved = await provider.resolveName(name);
    if (resolved && resolved.toLowerCase() === address.toLowerCase()) {
      return name;
    }
    return null;
  } catch (err) {
    console.error("ENS resolution error:", err);
    return null;
  }
}

/**
 * Resolves the full ENS profile for a given Ethereum address.
 * @param {string} address - The Ethereum address to look up.
 * @returns {Promise<object|null>} - The ENS profile object or null.
 */
async function getENSProfile(address) {
  const name = await getENSName(address);
  if (!name) {
    return { address, name: null, avatar: null, description: null, url: null, twitter: null, github: null };
  }

  const resolver = await provider.getResolver(name);
  if (!resolver) {
    return { address, name, avatar: null, description: null, url: null, twitter: null, github: null };
  }

  const [avatar, description, url, twitter, github] = await Promise.all([
    resolver.getText("avatar"),
    resolver.getText("description"),
    resolver.getText("url"),
    resolver.getText("com.twitter"),
    resolver.getText("com.github"),
  ]);

  return { address, name, avatar, description, url, twitter, github };
}

module.exports = { getENSName, getENSProfile }; 