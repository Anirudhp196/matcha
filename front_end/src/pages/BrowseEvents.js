import React, { useState, useEffect } from "react";
import { useEvents } from "../hooks/useEvents";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./BrowseEvents.css";

const BrowseEvents = () => {
  const { events, loading, refetch } = useEvents();
  const { eventContract, address, role } = useWeb3();
  const { theme } = useTheme();
  const [txPending, setTxPending] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const isMatcha = theme === 'matcha';

  // Check if the user has a wallet connected
  useEffect(() => {
    setIsGuestUser(!address);
  }, [address]);

  // Filter events based on theme
  useEffect(() => {
    if (!events) {
      setFilteredEvents([]);
      return;
    }

    const filtered = events.filter(event => {
      // Check metadata for category
      const category = event.metadata?.attributes?.find(
        attr => attr.trait_type === "Category"
      )?.value?.toLowerCase();
      
      const eventName = event.metadata?.name?.toLowerCase() || "";
      const eventDescription = event.metadata?.description?.toLowerCase() || "";
      
      if (isMatcha) {
        // Sports-related keywords
        const sportsKeywords = ['match', 'game', 'football', 'soccer', 'basketball', 
                               'baseball', 'tennis', 'cricket', 'rugby', 'hockey',
                               'tournament', 'championship', 'league', 'sports', 
                               'athletic', 'esports', 'racing', 'golf'];
        
        return category === 'sports' || 
               sportsKeywords.some(keyword => 
                 eventName.includes(keyword) || 
                 eventDescription.includes(keyword)
               );
      } else {
        // Entertainment-related keywords
        const entertainmentKeywords = ['concert', 'music', 'band', 'artist', 'show',
                                      'performance', 'festival', 'comedy', 'theater',
                                      'theatre', 'opera', 'ballet', 'dance', 'dj',
                                      'live', 'tour', 'gig', 'recital', 'orchestra'];
        
        return category === 'entertainment' || 
               category === 'concert' ||
               !category || // If no category, default to entertainment
               entertainmentKeywords.some(keyword => 
                 eventName.includes(keyword) || 
                 eventDescription.includes(keyword)
               );
      }
    });
    
    setFilteredEvents(filtered);
  }, [events, isMatcha]);

  const buyTicket = async (eventId, price) => {
    if (!eventContract || !address) return alert("Connect wallet first!");
    if (role !== 'fan') return alert("Only fans can purchase tickets!");

    try {
      setTxPending(true);
      const tx = await eventContract.buyTicket(eventId, { value: price });
      await tx.wait();
      toast.success("Ticket purchased!");
      refetch();
    } catch (err) {
      console.error("Ticket purchase failed:", err);
      toast.error("Purchase failed!");
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className={`browse-events-container theme-${theme}`}>
      <h1 className={`page-title ${isMatcha ? 'matcha' : 'performative'}`}>
        {isMatcha ? '⚽ Upcoming Matches' : '🎸 Upcoming Concerts'}
      </h1>
      
      {isGuestUser ? (
        <div className={`guest-banner ${isMatcha ? 'matcha' : 'performative'}`}>
          <p>Connect your wallet to buy tickets and access exclusive features! 🎟️</p>
        </div>
      ) : loading ? (
        <div className="loading-events">
          <LoadingSpinner size="large" text={isMatcha ? "Loading upcoming matches..." : "Loading upcoming concerts..."} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className={`glow-text ${isMatcha ? 'matcha' : 'performative'}`}>
          🚫 No {isMatcha ? 'matches' : 'concerts'} available.
        </p>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((e, i) => (
            <EventCard
              key={i}
              event={e}
              onBuy={buyTicket}
              showBuyButton={!txPending && e.ticketsSold < e.maxTickets}
              isGuestUser={isGuestUser}
            />
          ))}
        </div>
      )}
      
      {/* Transaction loading overlay */}
      {txPending && (
        <LoadingSpinner fullscreen={true} text="Processing your purchase..." />
      )}
    </div>
  );
};

export default BrowseEvents;
