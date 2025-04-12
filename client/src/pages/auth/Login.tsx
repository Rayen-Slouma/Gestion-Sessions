import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  Divider, Paper, Stack
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Login: React.FC = () => {
  const { login, error, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'teacher') {
        navigate('/teacher/supervision');
      } else {
        navigate('/student');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      await login(values.email, values.password);
      setIsSubmitting(false);
    }
  });

  // Handlers for quick test logins
  const handleTestAdminLogin = async () => {
    setIsSubmitting(true);
    await login('admin@example.com', 'admin123');
    setIsSubmitting(false);
  };

  const handleTestTeacherLogin = async () => {
    setIsSubmitting(true);
    await login('john.smith@example.com', 'teacher123');
    setIsSubmitting(false);
  };

  const handleTestStudentLogin = async () => {
    setIsSubmitting(true);
    await login('alice.johnson@example.com', 'student123');
    setIsSubmitting(false);
  };

  const testButtonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  };

  const inputVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 + 0.1 }
    })
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Sign In
      </Typography>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </motion.div>
      )}

      <motion.div custom={1} variants={inputVariants} initial="initial" animate="animate">
        <TextField
          margin="normal"
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
      </motion.div>

      <motion.div custom={2} variants={inputVariants} initial="initial" animate="animate">
        <TextField
          margin="normal"
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />
      </motion.div>

      <motion.div custom={3} variants={inputVariants} initial="initial" animate="animate">
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.2,
            background: 'linear-gradient(90deg, #2563eb, #4f46e5)'
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
        </Button>
      </motion.div>

      {/* TEST LOGIN - REMOVE IN PRODUCTION */}
      <motion.div custom={4} variants={inputVariants} initial="initial" animate="animate">
        <Divider sx={{ my: 2 }} />
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 249, 196, 0.6)', mt: 2, borderRadius: '12px' }}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Development Testing Only
          </Typography>
          <Typography variant="body2" gutterBottom>
            Quick login with test accounts
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <MotionButton
              size="small"
              variant="outlined"
              color="warning"
              onClick={handleTestAdminLogin}
              disabled={isSubmitting}
              variants={testButtonVariants}
              whileHover="hover"
              whileTap="tap"
              sx={{ borderRadius: '10px' }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : "Login as Admin"}
            </MotionButton>
            <MotionButton
              size="small"
              variant="outlined"
              color="info"
              onClick={handleTestTeacherLogin}
              disabled={isSubmitting}
              variants={testButtonVariants}
              whileHover="hover"
              whileTap="tap"
              sx={{ borderRadius: '10px' }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : "Login as Teacher"}
            </MotionButton>
            <MotionButton
              size="small"
              variant="outlined"
              color="success"
              onClick={handleTestStudentLogin}
              disabled={isSubmitting}
              variants={testButtonVariants}
              whileHover="hover"
              whileTap="tap"
              sx={{ borderRadius: '10px' }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : "Login as Student"}
            </MotionButton>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Login;
