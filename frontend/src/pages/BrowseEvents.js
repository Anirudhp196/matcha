import React, { useState, useEffect } from "react";
import { useEvents } from "../hooks/useEvents";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import EventCard from "../components/EventCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { MatchaIcon, MusicPerformanceIcon, TicketIcon } from "../components/Icons";
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

  // Filter events based on theme using eventType from smart contract
  useEffect(() => {
    if (!events) {
      setFilteredEvents([]);
      return;
    }

    const filtered = events.filter(event => {
      // Use eventType from smart contract: 0 = Performance, 1 = Sports
      console.log(`Event ${event.id}: ${event.metadata?.name}, eventType: ${event.eventType}, isMatcha: ${isMatcha}`);
      
      if (isMatcha) {
        // Show sports events (eventType = 1) on Match-a side
        return event.eventType === 1;
      } else {
        // Show performance events (eventType = 0) on Performative side
        return event.eventType === 0;
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
      toast.success(`${isMatcha ? 'Match' : 'Concert'} ticket purchased!`);
      refetch();
    } catch (err) {
      console.error("Ticket purchase failed:", err);
      if (err.message.includes("OnlyFansCanBuyTickets")) {
        toast.error("Only fans can purchase tickets!");
      } else {
        toast.error("Purchase failed!");
      }
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className={`browse-events-container theme-${theme}`}>
      <h1 className={`page-title ${isMatcha ? 'matcha' : 'performative'}`}>
        {isMatcha ? <><MatchaIcon size={32} /> Upcoming Matches</> : <><MusicPerformanceIcon size={32} /> Upcoming Concerts</>}
      </h1>
      
      {isGuestUser ? (
        <div className={`guest-banner ${isMatcha ? 'matcha' : 'performative'}`}>
          <p>Connect your wallet to buy tickets and access exclusive features! <TicketIcon size={20} /></p>
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
