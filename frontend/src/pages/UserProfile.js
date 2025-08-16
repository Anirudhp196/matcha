import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { usePrivy } from '@privy-io/react-auth';
import SecuritySettings from '../components/SecuritySettings';
import FundWalletButton from '../components/FundWalletButton';
import './UserProfile.css';

const UserProfile = () => {
  const { address, getDisplayName, role, ensName, ensAvatar } = useWeb3();
  const { user } = usePrivy();

  return (
    <div className="user-profile">
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
          <p className="role-badge">{role}</p>
          {user?.email && <p className="email">{user.email.address}</p>}
          <p className="address">{address}</p>
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
  );
};

export default UserProfile;
