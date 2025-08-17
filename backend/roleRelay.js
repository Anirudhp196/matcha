const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Load contract ABI
const EventManagerAbi = require('../frontend/src/abis/EventManager.json');

// Initialize provider and relayer wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "https://testnet.evm.nodes.onflow.org");
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY, provider);

console.log("🎯 Role Relay Service Starting...");
console.log("📍 Relayer Address:", relayerWallet.address);
console.log("📍 Contract Address:", EventManagerAbi.address);

// Create contract instance
const eventContract = new ethers.Contract(EventManagerAbi.address, EventManagerAbi.abi, relayerWallet);

// Sponsored role registration endpoint
app.post('/api/sponsor-role-registration', async (req, res) => {
  try {
    const { userAddress, role, signature } = req.body;
    
    console.log("🎭 Role registration request:", { userAddress, role, signature });
    
    // Validate inputs
    if (!userAddress || !ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }
    
    if (!['fan', 'musician'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "fan" or "musician"' });
    }
    
    if (!signature || !signature.v || !signature.r || !signature.s) {
      return res.status(400).json({ error: 'Valid signature required' });
    }
    
    // Check if user already has a role
    const currentRole = await eventContract.roles(userAddress);
    if (currentRole.toString() !== '0') {
      return res.status(400).json({ error: 'User already has a role' });
    }
    
    // Prepare meta-transaction
    let tx;
    if (role === 'fan') {
      console.log("👥 Executing registerAsFanMeta for:", userAddress);
      tx = await eventContract.registerAsFanMeta(
        userAddress,
        signature.v,
        signature.r,
        signature.s,
        { gasLimit: 150000 }
      );
    } else if (role === 'musician') {
      console.log("🎵 Executing registerAsMusicianMeta for:", userAddress);
      tx = await eventContract.registerAsMusicianMeta(
        userAddress,
        signature.v,
        signature.r,
        signature.s,
        { gasLimit: 150000 }
      );
    }
    
    console.log("📤 Transaction sent:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    res.json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error("❌ Role registration failed:", error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    relayer: relayerWallet.address,
    contract: EventManagerAbi.address
  });
});

// Get relayer balance
app.get('/api/relayer-balance', async (req, res) => {
  try {
    const balance = await relayerWallet.getBalance();
    res.json({
      address: relayerWallet.address,
      balance: ethers.utils.formatEther(balance),
      balanceWei: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.ROLE_RELAY_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Role Relay Service running on port ${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /api/sponsor-role-registration`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/relayer-balance`);
});

module.exports = app;
