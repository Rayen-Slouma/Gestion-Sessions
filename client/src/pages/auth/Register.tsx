import React from 'react';
import { Box, Typography, Button, Paper, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School as SchoolIcon } from '@mui/icons-material';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card elevation={2} sx={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Registration Not Available
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              Account creation is managed by administrators only.
              Please contact your administrator to request an account.
            </Typography>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 4, 
                  py: 1,
                  background: 'linear-gradient(90deg, #2563eb, #4f46e5)'
                }}
              >
                Back to Login
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Register;
