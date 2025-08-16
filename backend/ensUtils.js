const { ethers } = require("ethers");
require("dotenv").config();

// Default to mainnet for ENS resolution, can be parameterized if needed
// Use Infura if key is provided, otherwise use a public endpoint for testing
const rpcUrl = process.env.INFURA_KEY 
  ? `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
  : "https://rpc.ankr.com/eth"; // Public RPC endpoint

// Handle both ethers v5 and v6 syntax
let provider;
try {
  // Try ethers v6 syntax first
  provider = new ethers.JsonRpcProvider(rpcUrl);
} catch (error) {
  // Fallback to ethers v5 syntax
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);
}

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

  // Process avatar URL to handle IPFS and other formats
  let processedAvatar = avatar;
  if (avatar) {
    if (avatar.startsWith('ipfs://')) {
      processedAvatar = avatar.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else if (avatar.startsWith('ipfs/')) {
      processedAvatar = `https://ipfs.io/ipfs/${avatar.slice(5)}`;
    }
  }

  return { address, name, avatar: processedAvatar, description, url, twitter, github };
}

module.exports = { getENSName, getENSProfile }; 