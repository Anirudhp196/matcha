import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import "./EventCard.css"; // Reuse styling
import "./ManageEventCard.css"; // Add specific styling

const ManageEventCard = ({ event, onCancel, onUpdate }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  
  const {
    id,
    metadata,
    price,
    maxTickets,
    ticketsSold,
    eventDate,
    cancelled,
  } = event;

  const name = metadata?.name || "Untitled Concert";
  const description = metadata?.description || "No description.";
  const location = metadata?.attributes?.find(attr => attr.trait_type === "Location")?.value || "Unknown Location";
  const artistName = metadata?.attributes?.find(attr => attr.trait_type === "Artist Name")?.value || 
                   metadata?.attributes?.find(attr => attr.trait_type === "Artist")?.value || "Unknown Artist";
  
  const imageURL = metadata?.image?.startsWith("ipfs://")
    ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
    : metadata?.image || "https://via.placeholder.com/400x200.png?text=Concert";

  const formattedDate = eventDate
    ? new Date(Number(eventDate) * 1000).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : "Date TBD";

  const formattedPrice = price ? `${ethers.utils.formatEther(price)} DOT` : "—";
  const sold = ticketsSold ? ticketsSold.toString() : "0";
  const supply = maxTickets ? maxTickets.toString() : "?";

  const handleCancel = async () => {
    if (cancelled || isCancelling) return;
    
    try {
      setIsCancelling(true);
      await onCancel?.(id);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="event-card manage-event-card">
      {cancelled && <div className="cancelled-banner">Cancelled</div>}
      
      <img src={imageURL} alt={name} className="event-image" />

      <div className="event-details">
        <h3 className="event-title">{name}</h3>
        
        <p className="artist-name">🎤 {artistName}</p>
        <p className="location-name">📍 {location}</p>
        <p className="date-name">🗓 {formattedDate}</p>
        
        <div className="event-ticket-info">
          <p className="ticket-sold">🎫 {sold} / {supply} sold</p>
        </div>

        <div className="price-section">
          💰 <span className="price-text">{formattedPrice}</span>
        </div>

        {/* Only show buttons if the event is not cancelled */}
        {!cancelled && (
          <>
            <div className="admin-buttons">
              <button 
                onClick={handleCancel} 
                className="cancel-button"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <span className="button-loading">
                    <LoadingSpinner size="small" />
                    <span>Cancelling...</span>
                  </span>
                ) : (
                  <>
                    <span className="icon">⚠️</span> Cancel Event
                  </>
                )}
              </button>
            </div>

            <button
              className="resell-button"
              onClick={() => navigate(`/marketplace/${id}`)}
            >
              🔁 View Marketplace
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageEventCard;
