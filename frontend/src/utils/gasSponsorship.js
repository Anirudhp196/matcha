import { ethers } from 'ethers';
import { CONTRACTS } from '../contracts/config';

class GasSponsorship {
  constructor(relayServerUrl = 'http://localhost:3001') {
    this.relayServerUrl = relayServerUrl;
  }

  // Check if a function is eligible for gas sponsorship
  async isEligibleForSponsorship(functionName) {
    try {
      const response = await fetch(`${this.relayServerUrl}/sponsor-info`);
      const data = await response.json();
      return data.supportedFunctions.includes(functionName);
    } catch (error) {
      console.error('Failed to check sponsorship eligibility:', error);
      return false;
    }
  }

  // Execute a sponsored transaction (simplified for Privy compatibility)
  async executeSponsoredTransaction(contract, functionName, args = [], value = 0) {
    try {
      console.log(`🎯 Attempting sponsored transaction: ${functionName}`);
      
      // Check if eligible for sponsorship
      const isEligible = await this.isEligibleForSponsorship(functionName);
      if (!isEligible) {
        throw new Error(`Function ${functionName} not eligible for gas sponsorship`);
      }

      // Get user address
      const signer = contract.signer;
      const userAddress = await signer.getAddress();

      console.log('📝 Sending transaction to relay server...');

      // Send transaction details to relay server (no signing needed)
      const response = await fetch(`${this.relayServerUrl}/relay-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType: this.getContractType(contract.address),
          functionName,
          args,
          value: value || 0,
          userAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Relay failed');
      }

      console.log('✅ Transaction sponsored and executed:', result.transactionHash);
      
      // Return a transaction-like object
      return {
        hash: result.transactionHash,
        wait: async () => {
          // Wait for transaction confirmation
          const provider = contract.provider;
          return provider.waitForTransaction(result.transactionHash);
        },
        sponsored: true,
        sponsoredBy: result.sponsoredBy,
      };

    } catch (error) {
      console.error('Sponsored transaction failed:', error);
      throw error;
    }
  }

  // Determine contract type from address
  getContractType(address) {
    if (address.toLowerCase() === CONTRACTS.EventManager.address.toLowerCase()) {
      return 'EventManager';
    } else if (address.toLowerCase() === CONTRACTS.Ticket.address.toLowerCase()) {
      return 'Ticket';
    } else if (address.toLowerCase() === CONTRACTS.Marketplace.address.toLowerCase()) {
      return 'Marketplace';
    }
    
    throw new Error('Unknown contract address');
  }

  // Get sponsor information
  async getSponsorInfo() {
    try {
      const response = await fetch(`${this.relayServerUrl}/sponsor-info`);
      return response.json();
    } catch (error) {
      console.error('Failed to get sponsor info:', error);
      return null;
    }
  }
}

export default GasSponsorship;
