import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

// Admin pages
import ManageUsers from './pages/admin/ManageUsers';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageSubjects from './pages/admin/ManageSubjects';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminReports from './pages/admin/AdminReports';

// Faculty pages
import MarkAttendance from './pages/faculty/MarkAttendance';
import AttendanceHistory from './pages/faculty/AttendanceHistory';
import FacultyLeaves from './pages/faculty/FacultyLeaves';

// Student pages
import MyAttendance from './pages/student/MyAttendance';
import StudentLeaves from './pages/student/StudentLeaves';

import Layout from './components/shared/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return children;
};

const RoleRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRouter />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="leaves" element={<FacultyLeaves />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leaves" element={<StudentLeaves />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
