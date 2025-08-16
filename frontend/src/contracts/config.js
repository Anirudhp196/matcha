// Centralized contract configuration
import EventManagerAbi from "../abis/EventManager.json";
import TicketAbi from "../abis/Ticket.json";
import MarketplaceAbi from "../abis/Marketplace.json";

export const CONTRACTS = {
  EventManager: {
    address: EventManagerAbi.address,
    abi: EventManagerAbi.abi
  },
  Ticket: {
    address: TicketAbi.address,
    abi: TicketAbi.abi
  },
  Marketplace: {
    address: MarketplaceAbi.address,
    abi: MarketplaceAbi.abi
  }
};

// Network configuration for Privy
export const NETWORK_CONFIG = {
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: { 
    name: "CHZ", 
    symbol: "CHZ", 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ["https://spicy-rpc.chiliz.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "ChilizScan",
      url: "https://testnet.chiliscan.com"
    }
  }
};

// Export individual addresses for convenience
export const CONTRACT_ADDRESSES = {
  EVENT_MANAGER: EventManagerAbi.address,
  TICKET: TicketAbi.address,
  MARKETPLACE: MarketplaceAbi.address
};

export default CONTRACTS;
