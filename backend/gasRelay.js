const { ethers } = require("ethers");
require("dotenv").config();

class GasRelay {
  constructor() {
    // Your sponsor wallet that pays for gas
    this.provider = new ethers.providers.JsonRpcProvider("https://spicy-rpc.chiliz.com");
    this.sponsorWallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    console.log("Gas Relay initialized with sponsor:", this.sponsorWallet.address);
  }

  // Execute a transaction directly with sponsor wallet
  async executeTransaction(contractAddress, contractABI, functionName, args, value) {
    try {
      console.log(`Executing sponsored transaction: ${functionName}`);
      
      // Create contract instance with sponsor wallet
      const contract = new ethers.Contract(contractAddress, contractABI, this.sponsorWallet);
      
      // Execute the transaction with sponsor wallet paying gas
      const tx = await contract[functionName](...args, {
        value: value || 0,
        gasLimit: 500000, // Adjust as needed
      });
      
      console.log("Transaction executed:", tx.hash);
      return tx;
      
    } catch (error) {
      console.error("Transaction execution failed:", error);
      throw error;
    }
  }

  // Legacy method - keep for backwards compatibility
  async relayTransaction(userSignedTx, contractAddress, contractABI) {
    try {
      // Parse the user's signed transaction
      const parsedTx = ethers.utils.parseTransaction(userSignedTx);
      
      // Create contract instance with sponsor wallet
      const contract = new ethers.Contract(contractAddress, contractABI, this.sponsorWallet);
      
      // Extract function call data
      const iface = new ethers.utils.Interface(contractABI);
      const decodedData = iface.parseTransaction({ data: parsedTx.data });
      
      console.log("Relaying transaction:", decodedData.name);
      
      // Execute the transaction with sponsor wallet paying gas
      const tx = await contract[decodedData.name](...decodedData.args, {
        value: parsedTx.value || 0,
        gasLimit: 500000, // Adjust as needed
      });
      
      console.log("Transaction relayed:", tx.hash);
      return tx;
      
    } catch (error) {
      console.error("Relay failed:", error);
      throw error;
    }
  }

  // Check if transaction should be sponsored (add your rules here)
  shouldSponsor(functionName, userAddress) {
    const sponsoredFunctions = [
      'buyTicket',
      'registerAsFan', 
      'registerAsMusician',
      'registerAsSportsTeam'
    ];
    
    return sponsoredFunctions.includes(functionName);
  }

  // Get sponsor wallet balance
  async getSponsorBalance() {
    const balance = await this.sponsorWallet.getBalance();
    return ethers.utils.formatEther(balance);
  }
}

module.exports = GasRelay;
