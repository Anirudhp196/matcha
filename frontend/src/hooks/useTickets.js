import { useWeb3 } from "../contexts/Web3Context";
import { useState, useEffect } from "react";

export const useTickets = () => {
  const { ticketContract, address, eventContract } = useWeb3();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTickets = async () => {
    if (!ticketContract || !address || !eventContract) return;
    setLoading(true);

    try {
      console.log("DEBUG: Fetching tickets for address:", address);
      const total = await ticketContract.nextTokenId();
      console.log("DEBUG: Total tickets minted (nextTokenId):", total.toString());
      const owned = [];

      for (let i = 0; i < total; i++) {
        try {
          const owner = await ticketContract.ownerOf(i);
          console.log(`DEBUG: Ticket ${i} owner: ${owner}`);
          if (owner.toLowerCase() === address.toLowerCase()) {
            const uri = await ticketContract.tokenURI(i);
            const eventId = await ticketContract.tokenToEvent(i);
            
            // Get event details to determine type
            const eventData = await eventContract.events(eventId);
            
            owned.push({ 
              tokenId: i, 
              uri,
              eventId: eventId.toNumber(),
              // All events are now concert/performance events
              eventData
            });
            console.log("DEBUG: Added owned ticket:", i);
          }
        } catch (err) {
          console.warn(`WARN: Could not get owner for ticket ${i} (might be non-existent or error):`, err.message);
          // Might be non-existent tokenId — skip
        }
      }

      console.log("DEBUG: Finished fetching. Owned tickets found:", owned.length);
      setTickets(owned);
    } catch (err) {
      console.error("Failed to fetch tickets (outer catch):", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMyTickets();
  }, [ticketContract, address, eventContract]);

  return { tickets, loading, refetch: fetchMyTickets };
};
