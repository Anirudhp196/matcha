const express = require("express");
const { getENSName } = require("../ensUtils");
require("dotenv").config();

const app = express();
const PORT = process.env.ENS_API_PORT || 4000;

// ENS name resolution endpoint
app.get("/api/ens-name/:address", async (req, res) => {
  const { address } = req.params;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }
  const ensName = await getENSName(address);
  res.json({ address, ensName });
});

app.listen(PORT, () => {
  console.log(`ENS API server running on port ${PORT}`);
}); 