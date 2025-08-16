const express = require("express");
const { getENSName, getENSProfile } = require("../ensUtils");
require("dotenv").config();

const app = express();
const PORT = process.env.ENS_API_PORT || 4000;

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ENS name resolution endpoint
app.get("/api/ens-name/:address", async (req, res) => {
  const { address } = req.params;
  console.log(`ENS name lookup request for address: ${address}`);
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.log(`Invalid address format: ${address}`);
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  
  try {
    const ensName = await getENSName(address);
    console.log(`ENS name result for ${address}:`, ensName);
    res.json({ address, ensName });
  } catch (error) {
    console.error(`Error looking up ENS name for ${address}:`, error);
    res.status(500).json({ error: "ENS lookup failed" });
  }
});

// New ENS profile resolution endpoint
app.get("/api/ens-profile/:address", async (req, res) => {
  const { address } = req.params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  const ensProfile = await getENSProfile(address);
  res.json(ensProfile);
});

app.listen(PORT, () => {
  console.log(`ENS API server running on port ${PORT}`);
}); 