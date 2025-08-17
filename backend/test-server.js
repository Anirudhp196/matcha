console.log("🔧 Starting test server...");

const express = require("express");
console.log("✅ Express loaded");

const app = express();
console.log("✅ App created");

const PORT = 4000;
console.log("✅ Port set to:", PORT);

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Test server is working!" });
});

console.log("✅ Route defined");

// Start the server
console.log("🚀 Starting server...");
const server = app.listen(PORT, () => {
  console.log(`🎉 Test server running on port ${PORT}`);
});

console.log("✅ Listen called");

// Handle errors
server.on('error', (err) => {
  console.error("❌ Server error:", err);
});

console.log("✅ Error handler set");
