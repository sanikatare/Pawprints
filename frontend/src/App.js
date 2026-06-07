import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Diagnosis from './pages/Diagnosis';
import HealthHistory from './pages/HealthHistory';
import Vaccinations from './pages/Vaccinations';
import Appointments from './pages/Appointments';
import Forum from './pages/Forum';
import MedicalRecords from './pages/MedicalRecords';
import Emergency from './pages/Emergency';
import CareSuggestions from './pages/CareSuggestions';
import AdminPanel from './pages/AdminPanel';
import AIAssistant from './pages/AIAssistant';
import SearchPage from './pages/SearchPage';
import Medications from './pages/Medications';
import WeightTracker from './pages/WeightTracker';
import Telemedicine from './pages/Telemedicine';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main style={{ minHeight: '100vh', paddingTop: user ? '70px' : '0' }}>
        {children}
      </main>
    </>
  );
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/pets" element={<PrivateRoute><Pets /></PrivateRoute>} />
        <Route path="/diagnosis" element={<PrivateRoute><Diagnosis /></PrivateRoute>} />
        <Route path="/health-history" element={<PrivateRoute><HealthHistory /></PrivateRoute>} />
        <Route path="/vaccinations" element={<PrivateRoute><Vaccinations /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
        <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
        <Route path="/medical-records" element={<PrivateRoute><MedicalRecords /></PrivateRoute>} />
        <Route path="/emergency" element={<PrivateRoute><Emergency /></PrivateRoute>} />
        <Route path="/care-suggestions" element={<PrivateRoute><CareSuggestions /></PrivateRoute>} />
        <Route path="/ai-assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/medications" element={<PrivateRoute><Medications /></PrivateRoute>} />
        <Route path="/weight-tracker" element={<PrivateRoute><WeightTracker /></PrivateRoute>} />
        <Route path="/telemedicine" element={<PrivateRoute><Telemedicine /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
