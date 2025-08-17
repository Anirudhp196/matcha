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

// Network configuration for Privy (Flow EVM Testnet)
export const NETWORK_CONFIG = {
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: { 
    name: "FLOW", 
    symbol: "FLOW", 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.nodes.onflow.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Flow EVM Testnet Explorer",
      url: "https://testnet.evm.nodes.onflow.org"
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
