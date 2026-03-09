import React, { createContext, useContext, useReducer } from 'react';
import auditService from '../services/auditService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false
};

// Context
const AuthContext = createContext(undefined);

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT':
      return initialState;
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    default:
      return state;
  }
}

// Role hierarchy for permission checking
const roleHierarchy = {
  admin: 3,
  manager: 2,
  viewer: 1
};

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (user) => {
    dispatch({ type: 'LOGIN', payload: user });
    
    // Log login event
    await auditService.createLog({
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      changes: {
        newValues: {
          username: user.username,
          role: user.role,
          loginTime: new Date().toISOString()
        }
      }
    });
  };

  const logout = async () => {
    if (state.user) {
      // Log logout event
      await auditService.createLog({
        action: 'logout',
        entityType: 'user',
        entityId: state.user.id,
        userId: state.user.id,
        changes: {
          oldValues: {
            username: state.user.username,
            role: state.user.role,
            logoutTime: new Date().toISOString()
          }
        }
      });
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (updates) => {
    if (state.user) {
      // Log user update event
      await auditService.createLog({
        action: 'update',
        entityType: 'user',
        entityId: state.user.id,
        userId: state.user.id,
        changes: {
          oldValues: state.user,
          newValues: { ...state.user, ...updates }
        }
      });
    }
    
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  // Check if the current user has sufficient permissions
  const hasPermission = (requiredRole) => {
    if (!state.user) return false;
    return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole];
  };

  const value = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for role-based access control
export function useRequireAuth(requiredRole) {
  const { state, hasPermission } = useAuth();
  return { user: state.user, hasPermission: () => hasPermission(requiredRole) };
} 