import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';

// Components & Guard
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Locations from './pages/Locations';
import ChangePassword from './pages/ChangePassword';

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Authentication route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Administration Dashboard routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="locations" element={<Locations />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        {/* Universal Dynamic Notification Layer */}
        <ToastContainer 
          position="top-right" 
          autoClose={4000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;
