import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Authentication pages
import Login from './pages/auth/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ScheduleGeneration from './pages/admin/ScheduleGeneration';
import ClassroomManagement from './pages/admin/ClassroomManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import GroupManagement from './pages/admin/GroupManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import SectionManagement from './pages/admin/SectionManagement';
import SessionFormPage from './pages/admin/SessionFormPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import AvailabilityForm from './pages/teacher/AvailabilityForm';
import SupervisionSchedule from './pages/teacher/SupervisionSchedule';

// Student pages
import ExamSchedule from './pages/student/ExamSchedule';
import Profile from './pages/student/Profile';

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
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="sections" element={<SectionManagement />} />
                <Route path="subjects" element={<SubjectManagement />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="classrooms" element={<ClassroomManagement />} />
                <Route path="schedule" element={<ScheduleGeneration />} />
                <Route path="session-form" element={<SessionFormPage />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/teacher" element={
                <PrivateRoute role="teacher">
                  <TeacherLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/teacher/supervision" replace />} />
                <Route path="availability" element={<AvailabilityForm />} />
                <Route path="supervision" element={<SupervisionSchedule />} />
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={
                <PrivateRoute role="student">
                  <StudentLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/student/exams" replace />} />
                <Route path="exams" element={<ExamSchedule />} />
                <Route path="profile" element={<Profile />} />
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
