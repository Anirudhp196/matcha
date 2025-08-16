import { useWeb3 } from "../contexts/Web3Context";
import { useState, useEffect } from "react";

export const useTickets = () => {
  const { ticketContract, address } = useWeb3();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTickets = async () => {
    if (!ticketContract || !address) return;
    setLoading(true);

    try {
      const total = await ticketContract.nextTokenId();
      const owned = [];

      for (let i = 0; i < total; i++) {
        try {
          const owner = await ticketContract.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            const uri = await ticketContract.tokenURI(i);
            owned.push({ tokenId: i, uri });
          }
        } catch (err) {
          // Might be non-existent tokenId — skip
        }
      }

      setTickets(owned);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMyTickets();
  }, [ticketContract, address]);

  return { tickets, loading, refetch: fetchMyTickets };
};
