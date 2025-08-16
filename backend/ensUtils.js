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

module.exports = { getENSName }; 