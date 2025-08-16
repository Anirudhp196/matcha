import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ size = "medium", text, fullscreen = false }) => {
  const sizeClass = `spinner-${size}`;
  
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner ${sizeClass}`}></div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }
  
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClass}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;