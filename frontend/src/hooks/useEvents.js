import { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import axios from "axios";

export const useEvents = () => {
  const { eventContract, address } = useWeb3();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetadata = async (ipfsURI) => {
    if (!ipfsURI) return {};
    const url = ipfsURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      console.error("Metadata fetch failed for", ipfsURI, err);
      return {};
    }
  };

  const fetchEvents = async () => {
    if (!eventContract) return;

    setLoading(true);
    try {
      const total = await eventContract.nextEventId();
      const promises = [];

      for (let i = 0; i < total; i++) {
        promises.push(eventContract.events(i));
      }

      const rawEvents = await Promise.all(promises);
      
      // For each user, get their loyalty tier for each artist
      const loyaltyPromises = [];
      if (address) {
        for (const event of rawEvents) {
          loyaltyPromises.push(eventContract.loyaltyTiers(address, event.organizer));
          loyaltyPromises.push(eventContract.attendanceCount(address, event.organizer));
        }
      }
      
      const loyaltyResults = address ? await Promise.all(loyaltyPromises) : [];

      const eventsWithMeta = await Promise.all(
        rawEvents.map(async (e, index) => {
          const meta = await fetchMetadata(e.metadataURI);
          
          // Calculate loyalty information if user is connected
          let isGoldHolder = false;
          let loyaltyProgress = 0;
          
          if (address) {
            const loyaltyTier = loyaltyResults[index * 2]; // Even indices are loyalty tiers
            const attended = loyaltyResults[index * 2 + 1]; // Odd indices are attendance counts
            const goldRequirement = e.goldRequirement.toNumber();
            
            isGoldHolder = loyaltyTier === 1; // Assuming 1 = Gold in the enum
            loyaltyProgress = goldRequirement > 0 
              ? Math.min(Math.floor((attended.toNumber() / goldRequirement) * 100), 100) 
              : 0;
          }
          
          return {
            id: e.id.toNumber(),
            metadata: meta,
            price: e.ticketPrice,
            maxTickets: e.maxTickets,
            ticketsSold: e.ticketsSold,
            eventDate: e.eventDate,
            organizer: e.organizer,
            cancelled: e.cancelled,
            goldRequirement: e.goldRequirement.toNumber(),
            isGoldHolder,
            loyaltyProgress,
            attendedCount: address ? loyaltyResults[index * 2 + 1]?.toNumber() : 0
          };
        })
      );

      setEvents(eventsWithMeta);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [eventContract, address]);

  return { events, loading, refetch: fetchEvents };
};
