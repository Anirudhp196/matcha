import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "./LoadingSpinner";
import { ArtistIcon, LocationIcon, CalendarIcon, TicketIcon, MoneyIcon, BuyIcon, ConnectIcon, MarketplaceIcon } from "./Icons";
import "./EventCard.css";

const EventCard = ({ event, onBuy, showBuyButton = true, isGuestUser = false }) => {
  const navigate = useNavigate();
  const { getArtistName, connectWallet, role } = useWeb3();
  const { theme } = useTheme();
  const [artistName, setArtistName] = useState("Unknown Artist");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const isMatcha = theme === 'matcha';

  const {
    id,
    metadata,
    price,
    maxTickets,
    ticketsSold,
    eventDate,
    organizer,
    cancelled
  } = event;

  const name = metadata?.name || (isMatcha ? "Untitled Match" : "Untitled Concert");
  const description = metadata?.description || "No description provided.";
  const location = metadata?.attributes?.find(attr => attr.trait_type === "Location")?.value || "Unknown Location";
  const imageURL = metadata?.image?.startsWith("ipfs://")
    ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
    : metadata?.image || (isMatcha ? "https://via.placeholder.com/400x200.png?text=Sports+Match" : "https://via.placeholder.com/400x200.png?text=Concert");

  // Get artist name from organizer address (ENS or shortened address only)
  useEffect(() => {
    if (organizer) {
      getArtistName(organizer).then(name => {
        if (name) setArtistName(name);
      });
    }
  }, [organizer, getArtistName]);

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

  const formattedPrice = price ? `${ethers.utils.formatEther(price)} CHZ` : "—";
  const sold = ticketsSold ? ticketsSold.toString() : "0";
  const supply = maxTickets ? maxTickets.toString() : "?";
  const soldOut = ticketsSold && maxTickets && ticketsSold.gte(maxTickets);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBuyTicket = async () => {
    if (isBuying) return;
    
    setIsBuying(true);
    try {
      await onBuy(id, price);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="event-card">
      {cancelled && <div className="cancelled-banner">Cancelled</div>}
      
      <img src={imageURL} alt={name} className="event-image" />

      <div className="event-details">
        <h3 className="event-title">{name}</h3>
        <p className="artist-name"><ArtistIcon size={16} /> {artistName}</p>
        <p className="location-name"><LocationIcon size={16} /> {location}</p>
        <p className="date-name"><CalendarIcon size={16} /> {formattedDate}</p>
        <div className="event-ticket-info">
          <p className="ticket-sold"><TicketIcon size={16} /> {soldOut ? "SOLD OUT" : `${supply - sold} tickets available`}</p>
        </div>

        <div className="price-section">
          <MoneyIcon size={16} /> <span className="price-text">{formattedPrice}</span>
        </div>

        {/* Only show buttons if event is not cancelled */}
        {!cancelled ? (
          <>
            {/* BUY BUTTON - Only shown for fans */}
            {showBuyButton && !isGuestUser && role === 'fan' && (
              <button
                className="buy-button"
                onClick={handleBuyTicket}
                disabled={soldOut || isBuying}
              >
                {soldOut ? "SOLD OUT" : (
                  isBuying ? (
                    <span className="button-loading">
                      <LoadingSpinner size="small" />
                      <span>Buying...</span>
                    </span>
                  ) : (<><BuyIcon size={16} /> Buy Ticket</>)
                )}
              </button>
            )}

            {/* For guests, show a connect wallet prompt instead of marketplace/buy buttons */}
            {isGuestUser ? (
              <button 
                className="connect-wallet-button"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <span className="button-loading">
                    <LoadingSpinner size="small" />
                    <span>Connecting...</span>
                  </span>
                ) : (<><ConnectIcon size={16} /> Connect Wallet</>)}
              </button>
            ) : (
              <button
                className="resell-button"
                onClick={() => navigate(`/marketplace/${id}`)}
              >
                <MarketplaceIcon size={16} /> View Marketplace
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default EventCard;
