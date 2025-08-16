import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'react-hot-toast';

const SecuritySettings = () => {
  const { user, updateUser } = usePrivy();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check current MFA status
    if (user?.mfa?.enabled) {
      setMfaEnabled(true);
    }
  }, [user]);

  const toggleMFA = async () => {
    try {
      setIsLoading(true);
      
      if (mfaEnabled) {
        // Disable MFA
        await updateUser({ mfa: { enabled: false } });
        setMfaEnabled(false);
        toast.success('Transaction MFA disabled');
      } else {
        // Enable MFA - this will prompt user to set up 2FA
        await updateUser({ mfa: { enabled: true } });
        setMfaEnabled(true);
        toast.success('Transaction MFA enabled! You\'ll need to verify for transactions.');
      }
    } catch (error) {
      console.error('Failed to update MFA settings:', error);
      toast.error('Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="security-settings">
      <h3>🔐 Transaction Security</h3>
      <div className="security-option">
        <div className="option-info">
          <h4>Multi-Factor Authentication (MFA)</h4>
          <p>
            Require verification with a second factor (fingerprint, SMS, etc.) 
            before any transaction. Recommended for extra security.
          </p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={mfaEnabled}
            onChange={toggleMFA}
            disabled={isLoading}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      {mfaEnabled && (
        <div className="mfa-info">
          <p>✅ MFA is active. You'll need to verify your identity for transactions.</p>
          <p>Verification remains valid for 15 minutes after approval.</p>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
