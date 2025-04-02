import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Authentication pages
import Login from './pages/auth/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ScheduleGeneration from './pages/admin/ScheduleGeneration';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import AvailabilityForm from './pages/teacher/AvailabilityForm';
import SupervisionSchedule from './pages/teacher/SupervisionSchedule';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import ExamSchedule from './pages/student/ExamSchedule';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<AuthLayout />}>
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="login" element={<Login />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <PrivateRoute role="admin">
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="schedule" element={<ScheduleGeneration />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={
                <PrivateRoute role="teacher">
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<TeacherDashboard />} />
                <Route path="availability" element={<AvailabilityForm />} />
                <Route path="supervision" element={<SupervisionSchedule />} />
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={
                <PrivateRoute role="student">
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<StudentDashboard />} />
                <Route path="exams" element={<ExamSchedule />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
