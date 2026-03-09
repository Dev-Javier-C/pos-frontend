import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: 'light' // default theme
};

// Context
const ThemeContext = createContext(undefined);

// Reducer
function themeReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme); // Persist theme preference
      return {
        ...state,
        theme: newTheme
      };
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return {
        ...state,
        theme: action.payload
      };
    default:
      return state;
  }
}

// Provider component
export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const value = {
    theme: state.theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 