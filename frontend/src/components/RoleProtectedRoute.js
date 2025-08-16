import React, { useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../contexts/ThemeContext';

const RoleProtectedRoute = ({ children }) => {
  const { role } = useWeb3();
  const { theme, setInitialThemeForRole } = useTheme();

  useEffect(() => {
    // Enforce theme restrictions based on role with a small delay to avoid conflicts
    if (role && theme) {
      const timer = setTimeout(() => {
        const isMatcha = theme === 'matcha';
        
        // If musician is on Match-a side, redirect to Performative
        if (role === 'musician' && isMatcha) {
          console.log('Redirecting musician to Performative side');
          setInitialThemeForRole('musician');
        }
        
        // If sports team is on Performative side, redirect to Match-a
        if (role === 'sportsTeam' && !isMatcha) {
          console.log('Redirecting sports team to Match-a side');
          setInitialThemeForRole('sportsTeam');
        }
      }, 100); // Small delay to ensure proper state initialization

      return () => clearTimeout(timer);
    }
  }, [role, theme, setInitialThemeForRole]);

  // Show access denied message if user is on wrong side
  const isMatcha = theme === 'matcha';
  const showAccessDenied = 
    (role === 'musician' && isMatcha) || 
    (role === 'sportsTeam' && !isMatcha);

  if (showAccessDenied) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 100, 100, 0.1)',
        border: '2px solid rgba(255, 100, 100, 0.3)',
        borderRadius: '12px',
        margin: '2rem'
      }}>
        <h2 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '2rem' }}>
          🚫 Access Restricted
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', maxWidth: '600px' }}>
          {role === 'musician' 
            ? "Musicians can only access the Performative side for managing concerts and music events."
            : "Sports Teams can only access the Match-a side for managing matches and sports events."
          }
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>
          You are being redirected to the appropriate side...
        </p>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem 2rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <strong>Your Role:</strong> {
            role === 'musician' ? 'Musician' : 
            role === 'sportsTeam' ? 'Sports Team' : 
            role || 'None'
          }
        </div>
      </div>
    );
  }

  return children;
};

export default RoleProtectedRoute;
