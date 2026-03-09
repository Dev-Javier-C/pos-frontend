// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Unauthorized from './components/Auth/Unauthorized';
import InventoryList from './components/Inventory/InventoryList';
import AuditLog from './components/Audit/AuditLog';
import Dashboard from './components/Dashboard/Dashboard';
import Navigation from './components/Layout/Navigation';

// Layout component to handle theme
const ThemedLayout = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppProvider>
          <AuthProvider>
            <ThemedLayout>
              <Navigation />
              <main className="py-6 max-w-[1500px] mx-auto">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <InventoryList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit"
                    element={
                      <ProtectedRoute requiredRole="manager">
                        <AuditLog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </ThemedLayout>
          </AuthProvider>
        </AppProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;