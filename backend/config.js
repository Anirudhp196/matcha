// Backend configuration for gas relay
const EventManagerAbi = require("../frontend/src/abis/EventManager.json");
const TicketAbi = require("../frontend/src/abis/Ticket.json");
const MarketplaceAbi = require("../frontend/src/abis/Marketplace.json");

const CONTRACTS = {
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

module.exports = { CONTRACTS };
