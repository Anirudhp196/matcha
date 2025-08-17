console.log("🔧 Starting ENS API server...");

const express = require("express");
console.log("✅ Express loaded");

const { getENSName, getENSProfile } = require("../ensUtils");
console.log("✅ ENS utilities loaded");

require("dotenv").config();
console.log("✅ Environment variables loaded");

const app = express();
const PORT = process.env.ENS_API_PORT || 4000;
console.log("✅ App created, port:", PORT);

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
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
  console.log(`ENS profile lookup request for address: ${address}`);
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.log(`Invalid address format: ${address}`);
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  
  try {
    const ensProfile = await getENSProfile(address);
    console.log(`ENS profile result for ${address}:`, ensProfile);
    res.json(ensProfile);
  } catch (error) {
    console.error(`Error looking up ENS profile for ${address}:`, error);
    res.status(500).json({ error: "ENS profile lookup failed" });
  }
});

console.log("🚀 Starting server on port", PORT);

const server = app.listen(PORT, () => {
  console.log(`🎉 ENS API server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error("❌ Server error:", err);
});

console.log("✅ Server setup complete");
