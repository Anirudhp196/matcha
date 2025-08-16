import React from "react";
import "./LoyaltyBadge.css";

const LoyaltyBadge = ({ isGold, progress, goal }) => {
  if (isGold) {
    return <span className="loyalty-badge">⭐ Gold</span>;
  }

  if (progress !== undefined && goal !== undefined) {
    return (
      <div className="progress-bar-container">
        <div className="progress-text">
          {progress}/{goal} attended
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min((progress / goal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoyaltyBadge;
