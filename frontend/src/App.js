import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import MarkAttendance from './pages/MarkAttendance';
import Leaves from './pages/Leaves';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#64748b', fontFamily:'Syne' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/mark" element={<ProtectedRoute roles={['faculty','admin']}><MarkAttendance /></ProtectedRoute>} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/students" element={<ProtectedRoute roles={['admin','faculty']}><Students /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['admin','faculty']}><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111827', color: '#f1f5f9', border: '1px solid #1e2d45', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
