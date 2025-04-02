import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container, Box, Paper, Typography, useTheme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { motion } from 'framer-motion';
import BackgroundPattern from '../components/common/BackgroundPattern';

// Create motion components with proper typing
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionSchoolIcon = motion(SchoolIcon);

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      backgroundImage: 'linear-gradient(45deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
      py: 4
    }}>
      <BackgroundPattern />
      <MotionContainer 
        maxWidth="xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <MotionPaper
          elevation={3}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.2
          }}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)'
            }
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <MotionSchoolIcon 
              sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <Typography 
              component="h1" 
              variant="h5" 
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              <Box component="span" sx={{ 
                background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                University Exam Management
              </Box>
            </Typography>
          </Box>
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <Outlet />
          </motion.div>
        </MotionPaper>
      </MotionContainer>
    </Box>
  );
};

export default AuthLayout;
