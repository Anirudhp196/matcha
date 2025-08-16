const express = require('express');
const cors = require('cors');
const GasRelay = require('./gasRelay');
const { CONTRACTS } = require('./config');

const app = express();
const relay = new GasRelay();

app.use(cors());
app.use(express.json());

// Relay endpoint for sponsored transactions
app.post('/relay-transaction', async (req, res) => {
  try {
    const { contractType, functionName, args, value, userAddress } = req.body;
    
    // Check if this transaction should be sponsored
    if (!relay.shouldSponsor(functionName, userAddress)) {
      return res.status(400).json({ 
        error: 'Transaction not eligible for sponsorship' 
      });
    }

    // Get contract details
    let contractAddress, contractABI;
    switch (contractType) {
      case 'EventManager':
        contractAddress = CONTRACTS.EventManager.address;
        contractABI = CONTRACTS.EventManager.abi;
        break;
      case 'Ticket':
        contractAddress = CONTRACTS.Ticket.address;
        contractABI = CONTRACTS.Ticket.abi;
        break;
      case 'Marketplace':
        contractAddress = CONTRACTS.Marketplace.address;
        contractABI = CONTRACTS.Marketplace.abi;
        break;
      default:
        return res.status(400).json({ error: 'Invalid contract type' });
    }

    // Execute the transaction directly (no user signature needed)
    const tx = await relay.executeTransaction(contractAddress, contractABI, functionName, args || [], value || 0);
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      sponsoredBy: relay.sponsorWallet.address
    });
    
  } catch (error) {
    console.error('Relay error:', error);
    res.status(500).json({ 
      error: 'Failed to relay transaction',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const balance = await relay.getSponsorBalance();
    res.json({
      status: 'healthy',
      sponsorBalance: `${balance} CHZ`,
      sponsorAddress: relay.sponsorWallet.address
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Get sponsor info
app.get('/sponsor-info', async (req, res) => {
  try {
    const balance = await relay.getSponsorBalance();
    res.json({
      sponsorAddress: relay.sponsorWallet.address,
      balance: `${balance} CHZ`,
      supportedFunctions: ['buyTicket', 'registerAsFan', 'registerAsMusician', 'registerAsSportsTeam']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Gas Relay Server running on port ${PORT}`);
  console.log(`💰 Sponsor wallet: ${relay.sponsorWallet.address}`);
});

module.exports = app;
