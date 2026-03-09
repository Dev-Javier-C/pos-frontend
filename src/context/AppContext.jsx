import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Initial state
const initialState = {
  inventory: [],
  auditLogs: [],
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      email: 'admin@example.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    },
    {
      id: '2',
      username: 'manager',
      password: 'manager123', // In production, this would be hashed
      email: 'manager@example.com',
      role: 'manager',
      firstName: 'Manager',
      lastName: 'User',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    },
    {
      id: '3',
      username: 'viewer',
      password: 'viewer123', // In production, this would be hashed
      email: 'viewer@example.com',
      role: 'viewer',
      firstName: 'Viewer',
      lastName: 'User',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    }
  ]
};

// Context
const AppContext = createContext(undefined);

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case 'ADD_LOG':
      return {
        ...state,
        auditLogs: [...state.auditLogs, action.payload]
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper functions for common operations
export function useInventoryOperations() {
  const { state, dispatch } = useApp();

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: uuidv4(),
      lastUpdated: new Date()
    };
    dispatch({ type: 'ADD_ITEM', payload: newItem });
    return newItem;
  };

  const updateItem = (item) => {
    const updatedItem = { ...item, lastUpdated: new Date() };
    dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
    return updatedItem;
  };

  const deleteItem = (id) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };

  return {
    items: state.inventory,
    addItem,
    updateItem,
    deleteItem
  };
}

export function useAuditLog() {
  const { state, dispatch } = useApp();

  const addLog = (log) => {
    const newLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_LOG', payload: newLog });
    return newLog;
  };

  return {
    logs: state.auditLogs,
    addLog
  };
}

export function useUserManagement() {
  const { state, dispatch } = useApp();

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: uuidv4(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return newUser;
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    return user;
  };

  const deleteUser = (id) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  return {
    users: state.users,
    addUser,
    updateUser,
    deleteUser
  };
} 