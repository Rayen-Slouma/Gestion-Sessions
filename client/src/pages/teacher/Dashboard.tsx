import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  List, ListItem, ListItemText, Divider, CircularProgress,
  Chip, Alert, Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { ExamSession } from '../../types';
import { getStatusColor, getStatusDisplayText } from '../../utils/sessionStatus';

const TeacherDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [upcomingSessions, setUpcomingSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch real data from API
      const response = await axios.get(`${API_URL}/api/sessions`);

      if (response.data.success) {
        setUpcomingSessions(response.data.data);
      } else {
        setError('Failed to fetch exam sessions');
      }
    } catch (error) {
      // Error fetching dashboard data
      setError('Error connecting to the server');
      setUpcomingSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1e40af' }}>
          Teacher Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          Welcome back, {user?.name}! Here's your supervision overview.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                height: '100%',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3b82f6' }}>
                Upcoming Exam Supervision
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : upcomingSessions.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>No upcoming exam supervisions scheduled.</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                    >
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {session.subject?.name} ({session.subject?.code})
                              </Typography>
                              <Chip
                                label={getStatusDisplayText(session.status || 'scheduled')}
                                size="small"
                                color={getStatusColor(session.status || 'scheduled')}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" sx={{ color: 'text.primary', display: 'block', mb: 0.5 }}>
                                {new Date(session.date).toLocaleDateString()} at {session.startTime} - {session.endTime}
                              </Typography>
                              <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                                <strong>Room:</strong> {session.classroom?.roomNumber} |
                                <strong>Groups:</strong> {session.groups?.map(g => g.name).join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < upcomingSessions.length - 1 && <Divider sx={{ my: 1 }} />}
                    </motion.div>
                  ))}
                </List>
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8b5cf6' }}>
                      Availability Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body1">
                        Your availability is set for the upcoming exam period
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      You can update your availability anytime from the Availability page.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ec4899' }}>
                      Quick Links
                    </Typography>
                    <List sx={{ p: 0 }}>
                      <ListItem
                        button
                        component="a"
                        href="/teacher/availability"
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)' },
                        }}
                      >
                        <ListItemText
                          primary="Update Availability"
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      <ListItem
                        button
                        component="a"
                        href="/teacher/supervision"
                        sx={{
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'rgba(236, 72, 153, 0.05)' },
                        }}
                      >
                        <ListItemText
                          primary="View Supervision Schedule"
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(TeacherDashboard);
