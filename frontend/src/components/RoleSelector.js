import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import "./RoleSelector.css";

const RoleSelector = ({ onSelectFan, onSelectArtist }) => {
  const [selecting, setSelecting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const handleSelectRole = async (role, callback) => {
    setSelecting(true);
    setSelectedRole(role);
    
    try {
      await callback();
    } finally {
      // In case there's an error, we'll still reset the state
      setSelecting(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="role-selector-overlay">
      <div className="role-selector-container">
        <div className="role-selector-header">
          <h2>Select your role</h2>
        </div>
        <div className="role-selector-content">
          <div className="role-option fan-option">
            <h3>🎟️ Fan</h3>
            <p className="role-description">Access and enjoy concert events</p>
            <button 
              className="role-button fan-button" 
              onClick={() => handleSelectRole('fan', onSelectFan)}
              disabled={selecting}
            >
              {selecting && selectedRole === 'fan' ? (
                <span className="role-loading">
                  <LoadingSpinner size="small" />
                  <span>Setting up...</span>
                </span>
              ) : (
                "Choose Fan"
              )}
            </button>
          </div>

          <div className="role-divider"></div>

          <div className="role-option artist-option">
            <h3>🎵 Musician</h3>
            <p className="role-description">Create and manage concert events</p>
            <button 
              className="role-button artist-button" 
              onClick={() => handleSelectRole('musician', onSelectArtist)}
              disabled={selecting}
            >
              {selecting && selectedRole === 'musician' ? (
                <span className="role-loading">
                  <LoadingSpinner size="small" />
                  <span>Setting up...</span>
                </span>
              ) : (
                "Choose Musician"
              )}
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default RoleSelector;