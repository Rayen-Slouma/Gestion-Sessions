import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  List, ListItem, ListItemText, Divider, Chip, CircularProgress,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { ExamSession } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [upcomingExams, setUpcomingExams] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupInfo] = useState({
    group: 'CS-1A',
    section: 'Computer Science, Year 1',
    semester: 1
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch real data from API
      const response = await axios.get(`${API_URL}/api/sessions`);

      if (response.data.success) {
        setUpcomingExams(response.data.data);
      } else {
        setError('Failed to fetch exam sessions');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error connecting to the server');
      setUpcomingExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1e40af' }}>
          Student Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          Welcome back, {user?.name}! Here's your exam overview.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                Upcoming Exams
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : upcomingExams.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>No upcoming exams scheduled.</Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {upcomingExams.map((exam, index) => (
                    <motion.div
                      key={exam._id}
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {exam.subject?.name} ({exam.subject?.code})
                              </Typography>
                              <Chip
                                size="small"
                                label={exam.status}
                                color={exam.status === 'scheduled' ? 'primary' :
                                       exam.status === 'ongoing' ? 'success' :
                                       exam.status === 'completed' ? 'default' : 'error'}
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" component="span" color="text.primary" sx={{ display: 'block', mb: 0.5 }}>
                                  <strong>Date:</strong> {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                                <Typography variant="body2" component="span" sx={{ display: 'block', mb: 0.5 }}>
                                  <strong>Time:</strong> {exam.startTime} - {exam.endTime}
                                </Typography>
                                <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                  <strong>Room:</strong> {exam.classroom?.roomNumber}
                                </Typography>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      {index < upcomingExams.length - 1 && <Divider sx={{ opacity: 0.6 }} />}
                    </motion.div>
                  ))}
                </List>
              )}
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
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
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8b5cf6' }}>
                      Your Group
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 100 }}>
                          Group:
                        </Typography>
                        <Typography variant="body1">
                          {groupInfo.group}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 100 }}>
                          Section:
                        </Typography>
                        <Typography variant="body1">
                          {groupInfo.section}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 100 }}>
                          Semester:
                        </Typography>
                        <Typography variant="body1">
                          {groupInfo.semester}
                        </Typography>
                      </Box>
                    </Box>
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
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#ec4899' }}>
                      Exam Information
                    </Typography>
                    <List sx={{ p: 0 }}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Total Exams
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {upcomingExams.length} exams scheduled this semester
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider sx={{ opacity: 0.6 }} />
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Next Exam
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {upcomingExams.length > 0
                                ? `${upcomingExams[0]?.subject?.name}, ${new Date(upcomingExams[0]?.date).toLocaleDateString()}`
                                : "No exams scheduled"}
                            </Typography>
                          }
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
    </Box>
  );
};

export default React.memo(StudentDashboard);
