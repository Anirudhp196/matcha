import React, { createContext, useContext, useState } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('performative'); // Default to concerts

  const toggleTheme = () => {
    setTheme(prev => prev === 'performative' ? 'matcha' : 'performative');
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Function to set initial theme based on role
  const setInitialThemeForRole = (role) => {
    // Everyone starts on performative side (concerts only)
    setTheme('performative');
  };

  // Apply theme to body element
  React.useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme, setInitialThemeForRole }}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
