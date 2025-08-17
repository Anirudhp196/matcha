import React, { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { useTickets } from "../hooks/useTickets";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import SecuritySettings from "../components/SecuritySettings";
import FundWalletButton from "../components/FundWalletButton";
import { TicketIcon } from "../components/Icons";
import "./ManageTickets.css";
import "../components/EventCard.css";

const ManageTickets = () => {
  const { ticketContract, marketplaceContract, eventContract, address, getDisplayName, role, ensName, ensAvatar, disconnectWallet } = useWeb3();
  const { user } = usePrivy();
  const { theme } = useTheme();
  const { tickets, loading, refetch } = useTickets();
  const [prices, setPrices] = useState({});
  const [txPending, setTxPending] = useState(false);
  const [currentTokenId, setCurrentTokenId] = useState(null);
  const [ticketDetails, setTicketDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);

  const isMatcha = theme === 'matcha';

  // All tickets are concert tickets now
  useEffect(() => {
    setFilteredTickets(tickets || []);
  }, [tickets]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!tickets || !tickets.length || !ticketContract || !eventContract) return;

      setLoadingDetails(true);
      
      try {
        const detailsPromises = tickets.map(async (ticket) => {
          const eventId = await ticketContract.tokenToEvent(ticket.tokenId);
          const event = await eventContract.events(eventId);
          const metadataUri = event.metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          const response = await fetch(metadataUri);
          const metadata = await response.json();
          const artistName = metadata.attributes?.find(attr => attr.trait_type === "Artist Name")?.value || 
                            metadata.attributes?.find(attr => attr.trait_type === "Artist")?.value || 
                            "Unknown Artist";
          const location = metadata.attributes?.find(attr => attr.trait_type === "Location")?.value || "Unknown Location";
          const formattedDate = event.eventDate 
            ? new Date(Number(event.eventDate) * 1000).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : "Date TBD";
          const formattedPrice = event.ticketPrice ? ethers.utils.formatEther(event.ticketPrice) : "—";
          
          return {
            tokenId: ticket.tokenId,
            eventId: eventId.toNumber(),
            name: metadata.name || (isMatcha ? "Untitled Match" : "Untitled Concert"),
            image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || ticket.uri.replace("ipfs://", "https://ipfs.io/ipfs/"),
            description: metadata.description || "No description available",
            artistName,
            location,
            date: formattedDate,
            price: formattedPrice,
            cancelled: event.cancelled
          };
        });
        
        const details = await Promise.all(detailsPromises);
        const detailsObject = details.reduce((acc, detail) => {
          acc[detail.tokenId] = detail;
          return acc;
        }, {});
        
        setTicketDetails(detailsObject);
      } catch (err) {
        console.error("Failed to fetch ticket details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    
    fetchTicketDetails();
  }, [tickets, ticketContract, eventContract]);

  const listTicket = async (tokenId) => {
    const priceInput = prices[tokenId];
    if (!priceInput) return toast.error("Set a price first!");

    try {
      setTxPending(true);
      setCurrentTokenId(tokenId);
      
      const parsedPrice = ethers.utils.parseEther(priceInput.toString());

      toast.loading("Approving ticket transfer...");
      await ticketContract.approve(marketplaceContract.address, tokenId);
      
      toast.loading("Listing ticket on marketplace...");
      const tx = await marketplaceContract.listTicket(tokenId, parsedPrice);
      await tx.wait();

      toast.dismiss();
      toast.success("Ticket listed!");
      await refetch();
    } catch (err) {
      console.error("List failed:", err);
      toast.error("❌ List failed.");
    } finally {
      setTxPending(false);
      setCurrentTokenId(null);
    }
  };

  return (
    <div className={`manage-tickets-container theme-${theme}`}>
      <h1 className={`page-title ${isMatcha ? 'matcha' : 'performative'}`}>
        🎟 Your Concert Tickets
      </h1>

      {loading || loadingDetails ? (
        <div className="loading-tickets">
          <LoadingSpinner size="large" text="Loading your tickets..." />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <p className="glow-text performative">
            No concert tickets owned yet.
          </p>
          <p className="ticket-help-text">
            Purchase concert tickets from the events page to see them here.
          </p>
        </div>
      ) : (
        <div className="ticket-grid">
          {filteredTickets.map((t) => {
            const details = ticketDetails[t.tokenId];
            const imageURL = details?.image || t.uri.replace("ipfs://", "https://ipfs.io/ipfs/") || "https://via.placeholder.com/400x200.png?text=Ticket";

            return (
              <div key={t.tokenId} className={`event-card ticket-card ${details?.cancelled ? 'cancelled' : ''}`}>
                {currentTokenId === t.tokenId && txPending && (
                  <div className="ticket-listing-overlay">
                    <LoadingSpinner size="medium" />
                    <p>Processing Listing...</p>
                  </div>
                )}
                {details?.cancelled && <div className="cancelled-banner">Event Cancelled</div>}

                <img
                  src={imageURL}
                  alt={details?.name || `Ticket ${t.tokenId}`}
                  className="event-image"
                />

                <div className="event-details ticket-content">
                  <h3 className="event-title">{details?.name || (isMatcha ? "Untitled Match" : "Untitled Concert")}</h3>
                  <p className="ticket-id-display">Ticket #{t.tokenId}</p>
                  <p className="artist-name">🎤 {details?.artistName || "Unknown Artist"}</p>
                  <p className="location-name">📍 {details?.location || "Unknown Location"}</p>
                  <p className="date-name">🗓 {details?.date || "Date TBD"}</p>
                  <p className="price-section">
                    💰 <span className="price-text">Original Price: {details?.price || "N/A"} CHZ</span>
                  </p>

                  {!details?.cancelled && (
                    <div className="ticket-resale">
                      <div className="price-input-container">
                        <input
                          type="number"
                          placeholder="Set Resale Price (CHZ)"
                          value={prices[t.tokenId] || ""}
                          onChange={(e) =>
                            setPrices({ ...prices, [t.tokenId]: e.target.value })
                          }
                          className="price-input"
                          disabled={txPending}
                          step="0.001"
                          min="0"
                        />
                      </div>

                      <button
                        className="list-button"
                        onClick={() => listTicket(t.tokenId)}
                        disabled={txPending || !prices[t.tokenId]}
                      >
                        {txPending && currentTokenId === t.tokenId ? (
                          <span className="button-loading">
                            <LoadingSpinner size="small" />
                            <span>Listing...</span>
                          </span>
                        ) : (
                          <>
                            <span className="icon">🔄</span>
                            List for Sale
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">
            {ensAvatar ? (
              <img src={ensAvatar} alt="Profile" />
            ) : (
              <div className="default-avatar">
                {getDisplayName()?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{getDisplayName()}</h1>
            <div className="role-badge">{role}</div>
            {user?.email && <p className="email">{user.email.address}</p>}
            <p className="address">{address}</p>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              🔌 Disconnect Wallet
            </button>
          </div>
        </div>

        <div className="profile-sections">
          <section className="wallet-section">
            <h2>💰 Wallet Management</h2>
            <div className="wallet-actions-container">
              <FundWalletButton className="fund-btn-large" />
              <div className="wallet-info">
                <p>Add funds to your wallet using credit card or transfer from exchanges.</p>
                <p>This helps you pay for gas fees when our sponsorship isn't available.</p>
              </div>
            </div>
          </section>

          <SecuritySettings />

          <section className="preferences-section">
            <h2>⚙️ Preferences</h2>
            <div className="preference-item">
              <label>
                <input type="checkbox" defaultChecked />
                Email notifications for ticket purchases
              </label>
            </div>
            <div className="preference-item">
              <label>
                <input type="checkbox" defaultChecked />
                Show gas sponsorship notifications
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
