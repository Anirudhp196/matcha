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

/**
 * Checks if an ENS name is available for registration.
 * @param {string} name - The ENS name to check (without .eth).
 * @returns {Promise<boolean>} - True if available, false if not.
 */
async function checkENSAvailability(name) {
  try {
    // Create registrar contract instance
    const registrarContract = new ethers.Contract("0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5", [
      "function available(string calldata name) external view returns (bool)"
    ], provider);
    
    const available = await registrarContract.available(name);
    return available;
  } catch (err) {
    console.error("ENS availability check error:", err);
    return false;
  }
}

/**
 * Gets the registration cost for an ENS name.
 * @param {string} name - The ENS name to check (without .eth).
 * @param {number} duration - Duration in years.
 * @returns {Promise<string|null>} - Cost in wei as string, or null if error.
 */
async function getENSRegistrationCost(name, duration = 1) {
  try {
    // Create registrar contract instance
    const registrarContract = new ethers.Contract("0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5", [
      "function rentPrice(string calldata name, uint256 duration) external view returns (uint256)"
    ], provider);
    
    const durationInSeconds = duration * 365 * 24 * 60 * 60;
    const cost = await registrarContract.rentPrice(name, durationInSeconds);
    return cost.toString();
  } catch (err) {
    console.error("ENS cost check error:", err);
    return null;
  }
}

module.exports = { getENSName, getENSProfile, checkENSAvailability, getENSRegistrationCost }; 