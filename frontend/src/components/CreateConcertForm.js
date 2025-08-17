import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useTheme } from "../contexts/ThemeContext";
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import "./CreateConcertForm.css";

const PINATA_API_KEY = "3bf4164172fae7b68de3";
const PINATA_SECRET = "32288745dd22dabdcc87653918e33841ccfcfbd45c43a89709f873aedcc7c9fe";

const CreateConcertForm = ({ onCreated }) => {
  const { eventContract, address, goldRequirement, getDisplayName, role } = useWeb3();
  const { theme } = useTheme();
  const isMatcha = theme === 'matcha';
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    totalSupply: "",
    date: "",
    location: ""
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    stage: "",
    percent: 0,
    isUploading: false
  });

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const uploadToPinata = async () => {
    setUploadProgress({
      stage: isMatcha ? "Uploading game image to IPFS" : "Uploading concert image to IPFS",
      percent: 10,
      isUploading: true
    });
    
    const formData = new FormData();
    formData.append("file", image);

    const imageRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
    });

    setUploadProgress({
      stage: isMatcha ? "Preparing game metadata" : "Preparing concert metadata",
      percent: 40,
      isUploading: true
    });

    const imageHash = imageRes.data.IpfsHash;
    const metadata = {
      name: form.name,
      description: form.description,
      image: `ipfs://${imageHash}`,
      attributes: [
        { trait_type: "Event Date", value: form.date },
        { trait_type: "Location", value: form.location },
        { trait_type: "Artist Address", value: address }
      ],
    };

    setUploadProgress({
      stage: isMatcha ? "Uploading game metadata to IPFS" : "Uploading concert metadata to IPFS",
      percent: 70,
      isUploading: true
    });

    const metadataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
      }
    );

    setUploadProgress({
      stage: isMatcha ? "Game data stored successfully" : "Concert data stored successfully",
      percent: 100,
      isUploading: true
    });

    return `ipfs://${metadataRes.data.IpfsHash}`;
  };

  const createConcert = async (e) => {
    e.preventDefault();
    console.log("CreateConcert: Using updated version without artistName requirement");
    console.log("Display name:", getDisplayName());
    console.log("Hello World!")
    
    if (!eventContract || !address) return toast.error("Connect your wallet first!");
    
    // Role-based validation - only musicians can create events
    if (role !== 'musician') {
      return toast.error("Only musicians can create concerts!");
    }
    
    if (!image) return toast.error("Please upload an image!");
    if (!form.price) return toast.error("Enter a valid ticket price.");
    // Artist name is automatically determined from wallet address or ENS

    // Check if the event date is in the future
    const eventDate = new Date(form.date);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      return toast.error("Concert date must be in the future!");
    }

    try {
      setLoading(true);
      
      // First upload to IPFS
      const metadataURI = await uploadToPinata();
      const eventDateTimestamp = Math.floor(eventDate.getTime() / 1000);

      // Get the latest gold requirement from context
      // This ensures that the most recently updated gold requirement is used
      const currentGoldRequirement = goldRequirement;
      
      setUploadProgress({
        stage: "Creating your concert on the blockchain",
        percent: 100,
        isUploading: true
      });
      
      // Create concert event
      const tx = await eventContract.createEvent(
        metadataURI,
        ethers.utils.parseEther(form.price.toString()),
        parseInt(form.totalSupply),
        eventDateTimestamp,
        currentGoldRequirement
      );
      
      setUploadProgress({
        stage: "Waiting for transaction confirmation",
        percent: 100,
        isUploading: true
      });
      
      await tx.wait();

      toast.success(isMatcha ? "Game created!" : "Concert created!");
      setForm({ name: "", description: "", price: "", totalSupply: "", date: "", location: "" });
      setImage(null);
      if (onCreated) onCreated();
    } catch (err) {
      console.error("Create failed:", err);
      toast.error(isMatcha ? "Failed to create game." : "Failed to create concert.");
    } finally {
      setLoading(false);
      setUploadProgress({
        stage: "",
        percent: 0,
        isUploading: false
      });
    }
  };

  const isFormValid = form.name && form.description && form.price && form.totalSupply && form.date && form.location && image;
  
  // Check if user has permission to create events - only musicians can create concerts
  const canCreateEvents = role === 'musician';

  if (!canCreateEvents) {
    return (
      <div className="access-restricted" style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 100, 100, 0.3)',
        borderRadius: '12px',
        margin: '2rem 0'
      }}>
        <h2 style={{color: '#ff6b6b', marginBottom: '1rem'}}>Access Restricted</h2>
        <p style={{marginBottom: '0.5rem'}}>
          Only Musicians can create concerts.
        </p>
        <p>Your current role: <strong>{role || 'None'}</strong></p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="create-concert-overlay">
          <div className="upload-progress">
            <LoadingSpinner size="large" />
            <h3>{uploadProgress.stage}</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{width: `${uploadProgress.percent}%`}}
              ></div>
            </div>
            <p className="progress-info">{uploadProgress.percent}% Complete</p>
          </div>
        </div>
      )}
      
      <form onSubmit={createConcert} className={`concert-form ${isMatcha ? 'matcha-theme' : 'performative-theme'}`}>
        <div className="form-group">
          <label htmlFor="name">{isMatcha ? 'Game Name' : 'Concert Name'}</label>
          <input 
            id="name" 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={updateField} 
            required 
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">{isMatcha ? 'Game Description' : 'Concert Description'}</label>
          <textarea 
            id="description" 
            name="description" 
            value={form.description} 
            onChange={updateField} 
            required 
            disabled={loading}
          />
        </div>
        
        <div className="form-row">
        <div className="form-group custom-datetime">
          <label htmlFor="date">Event Date & Time</label>
          <input 
            id="date" 
            type="datetime-local" 
            name="date" 
            value={form.date} 
            onChange={updateField} 
            required 
            disabled={loading}
          />
        </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input 
              id="location" 
              type="text" 
              name="location" 
              value={form.location} 
              onChange={updateField} 
              required 
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Ticket Price (FLOW)</label>
            <input 
              id="price" 
              type="number" 
              name="price" 
              value={form.price} 
              onChange={updateField} 
              step="0.001"
              min="0"
              required 
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="totalSupply">Total Tickets</label>
            <input 
              id="totalSupply" 
              type="number" 
              name="totalSupply" 
              value={form.totalSupply} 
              onChange={updateField} 
              required 
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="concertImage">{isMatcha ? 'Game Image' : 'Concert Image'}</label>
          <input 
            id="concertImage" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            required 
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading || !isFormValid}>
          {loading ? (
            <span className="button-loading">
              <LoadingSpinner size="small" />
              <span>{isMatcha ? 'Creating Game...' : 'Creating Concert...'}</span>
            </span>
          ) : (
            isMatcha ? "🚀 Launch Game" : "🚀 Launch Concert"
          )}
        </button>
      </form>
    </>
  );
};

export default CreateConcertForm;
