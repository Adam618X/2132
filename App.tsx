import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import Wizard from './pages/Wizard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;