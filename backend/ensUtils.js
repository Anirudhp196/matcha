const { ethers } = require("ethers");
require("dotenv").config();

// Use reliable RPC endpoints that support ENS
// Try multiple endpoints in order of preference (PublicNode first - best ENS support)
const rpcEndpoints = [
  "https://ethereum.publicnode.com", // Public Node - excellent ENS support ✅
  "https://rpc.ankr.com/eth", // Ankr - good backup
  "https://cloudflare-eth.com", // Cloudflare - fallback (limited ENS support)
  "https://eth.llamarpc.com" // LlamaRPC - last resort
];

// Handle both ethers v5 and v6 syntax with multiple endpoint fallback
let provider;
let activeRpcUrl = null;

async function initializeProvider() {
  if (provider) return provider; // Already initialized
  
  for (const rpcUrl of rpcEndpoints) {
    try {
      console.log(`Trying RPC endpoint: ${rpcUrl}`);
      
      // Try ethers v6 syntax first
      let testProvider;
      try {
        testProvider = new ethers.JsonRpcProvider(rpcUrl);
      } catch (error) {
        // Fallback to ethers v5 syntax
        testProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
      }
      
      // Test the provider with a simple call
      await testProvider.getNetwork();
      provider = testProvider;
      activeRpcUrl = rpcUrl;
      console.log(`✅ Successfully connected to: ${rpcUrl}`);
      return provider;
    } catch (error) {
      console.log(`❌ Failed to connect to ${rpcUrl}:`, error.message);
      continue;
    }
  }
  
  console.error("❌ Failed to connect to any RPC endpoint");
  throw new Error("No working RPC endpoint found");
}

/**
 * Resolves the ENS name for a given Ethereum address, and verifies it resolves back to the address.
 * @param {string} address - The Ethereum address to look up.
 * @returns {Promise<string|null>} - The ENS name if valid, or null if not set or not valid.
 */
async function getENSName(address) {
  try {
    await initializeProvider();
    console.log(`🔍 Looking up ENS name for: ${address} using ${activeRpcUrl}`);
    
    const name = await provider.lookupAddress(address);
    console.log(`📛 Reverse lookup result: ${name || 'No ENS name'}`);
    
    if (!name) return null;
    
    // Verify the name resolves back to the address
    const resolved = await provider.resolveName(name);
    console.log(`🔄 Forward lookup verification: ${resolved}`);
    
    if (resolved && resolved.toLowerCase() === address.toLowerCase()) {
      console.log(`✅ ENS verification successful: ${name}`);
      return name;
    } else {
      console.log(`❌ ENS verification failed: ${name} resolves to ${resolved}, expected ${address}`);
      return null;
    }
  } catch (err) {
    console.error("❌ ENS resolution error:", err.message);
    return null;
  }
}

/**
 * Resolves the full ENS profile for a given Ethereum address.
 * @param {string} address - The Ethereum address to look up.
 * @returns {Promise<object|null>} - The ENS profile object or null.
 */
async function getENSProfile(address) {
  try {
    await initializeProvider();
    console.log(`🔍 Looking up ENS profile for: ${address}`);
    
    const name = await getENSName(address);
    if (!name) {
      console.log(`❌ No ENS name found for ${address}`);
      return {
        address,
        name: null,
        avatar: null,
        description: null,
        url: null,
        twitter: null,
        github: null,
      };
    }

    console.log(`🔧 Getting resolver for: ${name}`);
    const resolver = await provider.getResolver(name);
    if (!resolver) {
      console.log(`❌ No resolver found for: ${name}`);
      return {
        address,
        name,
        avatar: null,
        description: null,
        url: null,
        twitter: null,
        github: null,
      };
    }

    console.log(`📊 Fetching profile data for: ${name}`);
    const [avatar, description, url, twitter, github] = await Promise.all([
      resolver.getText("avatar").catch(() => null),
      resolver.getText("description").catch(() => null),
      resolver.getText("url").catch(() => null),
      resolver.getText("com.twitter").catch(() => null),
      resolver.getText("com.github").catch(() => null),
    ]);

    // Process avatar URL to handle IPFS and other formats
    let processedAvatar = avatar;
    if (avatar) {
      console.log(`🖼️ Processing avatar: ${avatar}`);
      if (avatar.startsWith("ipfs://")) {
        processedAvatar = avatar.replace("ipfs://", "https://ipfs.io/ipfs/");
      } else if (avatar.startsWith("ipfs/")) {
        processedAvatar = `https://ipfs.io/ipfs/${avatar.slice(5)}`;
      }
      console.log(`🖼️ Processed avatar: ${processedAvatar}`);
    }

    const profile = {
      address,
      name,
      avatar: processedAvatar,
      description,
      url,
      twitter,
      github,
    };

    console.log(`✅ ENS profile complete:`, profile);
    return profile;
    
  } catch (err) {
    console.error("❌ ENS profile lookup error:", err.message);
    return {
      address,
      name: null,
      avatar: null,
      description: null,
      url: null,
      twitter: null,
      github: null,
    };
  }
}

module.exports = { getENSName, getENSProfile };
