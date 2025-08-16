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

  // Apply theme to body element
  React.useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
