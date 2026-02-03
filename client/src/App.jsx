import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

import Callback from './pages/Callback';
import UserDashboard from './pages/UserDashboard';
import Register from './pages/Register';
import Verify from './pages/Verify';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin" element={<Login />} /> {/* Redirect/Alias */}
        <Route path="/callback" element={<Callback />} />
        <Route 
          path="/user-dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
