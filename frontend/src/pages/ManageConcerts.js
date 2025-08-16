import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { useEvents } from "../hooks/useEvents";
import LoadingSpinner from "../components/LoadingSpinner";
import { MatchaIcon, MusicPerformanceIcon, TicketIcon } from "../components/Icons";
import "./ManageConcerts.css";
import CreateConcertForm from "../components/CreateConcertForm";
import ManageEventCard from "../components/ManageEventCard";
import GoldRequirementSetter from "../components/GoldRequirementSetter";

const ManageConcerts = () => {
  const { events, loading, refetch } = useEvents();
  const [myEvents, setMyEvents] = useState([]);
  const { address, eventContract, getDisplayName, goldRequirement } = useWeb3();
  const { theme } = useTheme();
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const isMatcha = theme === 'matcha';

  useEffect(() => {
    if (events && address) {
      const filtered = events.filter(
        (e) => e.organizer.toLowerCase() === address.toLowerCase()
      );
      setMyEvents(filtered);
    }
  }, [events, address]);

  const handleCancelEvent = async (eventId) => {
    try {
      const confirm = window.confirm("Are you sure you want to cancel this event?");
      if (!confirm) return;

      setIsCancelling(true);
      setCancellingEventId(eventId);
      
      toast.loading("Calculating refund amount...");
      const expectedRefund = await eventContract.totalReceived(eventId);
      
      toast.loading("Processing cancellation...");
      const tx = await eventContract.cancelEvent(eventId, { value: expectedRefund });
      await tx.wait();

      toast.dismiss();
      toast.success("Event cancelled and buyers refunded.");
      refetch();
    } catch (err) {
      console.error("Cancel failed:", err);
      toast.error("Failed to cancel event.");
    } finally {
      setIsCancelling(false);
      setCancellingEventId(null);
    }
  };

  return (
    <div className={`manage-concerts-container theme-${theme}`}>
      <h1 className={`page-title ${isMatcha ? 'matcha' : 'performative'}`}>
        {isMatcha ? <><MatchaIcon size={32} /> Manage Your Matches</> : <><MusicPerformanceIcon size={32} /> Manage Your Concerts</>}
      </h1>

      <div className="form-section loyalty-section">
        <h2 className="form-title">⭐ Loyalty Requirements</h2>
        <p className="section-description">
          Set how many of your {isMatcha ? 'matches' : 'concerts'} a fan needs to attend to achieve Gold status.
          Gold fans get early access to your new {isMatcha ? 'match' : 'concert'} tickets.
        </p>
        <div className="loyalty-settings">
          <div className="current-setting">
            <span className="setting-label">Current Requirement:</span>
            <span className="setting-value">{goldRequirement} concerts</span>
          </div>
          <GoldRequirementSetter />
        </div>
      </div>

      <hr className="neon-divider" />

      <div className="form-section">
        <h2 className="form-title">
          {isMatcha ? <><MatchaIcon size={24} /> Create a New Match</> : <><MusicPerformanceIcon size={24} /> Create a New Concert</>}
        </h2>
        <div className="form-wrapper">
          <CreateConcertForm onCreated={refetch} />
        </div>
      </div>

      <hr className="neon-divider" />

      <h2 className="form-title"><TicketIcon size={24} /> Your Events</h2>
      {loading ? (
        <div className="loading-events">
          <LoadingSpinner size="large" text="Loading your concerts..." />
        </div>
      ) : myEvents.length === 0 ? (
        <div className="no-events">
          <p className={`glow-text ${isMatcha ? 'matcha' : 'performative'}`}>
            🫥 You haven't hosted any {isMatcha ? 'matches' : 'concerts'} yet.
          </p>
          <p className="events-help-text">
            Create a {isMatcha ? 'match' : 'concert'} using the form above to get started.
          </p>
        </div>
      ) : (
        <div className="event-grid">
          {myEvents.map((e, i) => (
            <div key={i} className="event-card-wrapper">
              {isCancelling && cancellingEventId === e.id && (
                <div className="cancelling-overlay">
                  <LoadingSpinner size="medium" />
                  <p>Cancelling event and processing refunds...</p>
                </div>
              )}
              <ManageEventCard
                key={i}
                event={e}
                onCancel={handleCancelEvent}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageConcerts;
