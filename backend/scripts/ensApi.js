const express = require("express");
const { getENSName, getENSProfile, checkENSAvailability, getENSRegistrationCost } = require("../ensUtils");
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

// ENS availability check endpoint
app.get("/api/ens-available/:name", async (req, res) => {
  const { name } = req.params;
  console.log(`ENS availability check for name: ${name}`);
  
  if (!name || name.length < 3) {
    console.log(`Invalid name: ${name}`);
    return res.status(400).json({ error: "Name must be at least 3 characters long" });
  }
  
  // Clean the name (remove .eth if present, sanitize)
  const cleanName = name.toLowerCase().replace(/\.eth$/, "").replace(/[^a-z0-9]/g, "");
  
  if (cleanName !== name.toLowerCase().replace(/\.eth$/, "")) {
    return res.status(400).json({ error: "Name contains invalid characters" });
  }
  
  try {
    const available = await checkENSAvailability(cleanName);
    console.log(`ENS availability result for ${cleanName}:`, available);
    res.json({ name: cleanName, available });
  } catch (error) {
    console.error(`Error checking ENS availability for ${cleanName}:`, error);
    res.status(500).json({ error: "ENS availability check failed" });
  }
});

// ENS registration cost endpoint
app.get("/api/ens-cost/:name/:duration", async (req, res) => {
  const { name, duration } = req.params;
  console.log(`ENS cost check for name: ${name}, duration: ${duration} years`);
  
  if (!name || name.length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters long" });
  }
  
  const durationYears = parseInt(duration);
  if (isNaN(durationYears) || durationYears < 1 || durationYears > 10) {
    return res.status(400).json({ error: "Duration must be between 1 and 10 years" });
  }
  
  // Clean the name
  const cleanName = name.toLowerCase().replace(/\.eth$/, "").replace(/[^a-z0-9]/g, "");
  
  if (cleanName !== name.toLowerCase().replace(/\.eth$/, "")) {
    return res.status(400).json({ error: "Name contains invalid characters" });
  }
  
  try {
    const cost = await getENSRegistrationCost(cleanName, durationYears);
    console.log(`ENS cost result for ${cleanName} (${durationYears} years):`, cost);
    res.json({ name: cleanName, duration: durationYears, cost });
  } catch (error) {
    console.error(`Error getting ENS cost for ${cleanName}:`, error);
    res.status(500).json({ error: "ENS cost lookup failed" });
  }
});

app.listen(PORT, () => {
  console.log(`ENS API server running on port ${PORT}`);
}); 