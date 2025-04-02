import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Typography, Grid, Paper, Box, Card, CardContent,
  List, ListItem, ListItemText, Divider, CircularProgress, Alert,
  Chip, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import axios from 'axios';
import { API_URL } from '../../config';
import { DashboardStats, ChartDataItem } from '../../types';

interface PieLabelProps {
  name: string;
  percent: number;
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoized chart data
  const userRoleData: ChartDataItem[] = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value || 0
    }));
  }, [stats]);
  
  const sessionStatusData: ChartDataItem[] = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.sessionsByStatus).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value || 0
    }));
  }, [stats]);
  
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.error.main];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/dashboard/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch dashboard statistics');
        setMockData();
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Error connecting to the server');
      setMockData();
    } finally {
      setLoading(false);
    }
  }, []);

  const setMockData = useCallback(() => {
    setStats({
      counts: {
        users: 25,
        teachers: 8,
        students: 16,
        subjects: 12,
        sections: 6,
        groups: 10,
        classrooms: 8,
        sessions: 18
      },
      upcomingSessions: [
        {
          id: '1',
          subject: 'Computer Science 101 (CS101)',
          date: new Date().toISOString(),
          time: '09:00 - 11:00',
          classroom: 'A101',
          groups: 'CS-1A, CS-1B'
        },
        {
          id: '2',
          subject: 'Mathematics 201 (MATH201)',
          date: new Date(Date.now() + 86400000).toISOString(),
          time: '13:00 - 15:00',
          classroom: 'B205',
          groups: 'MATH-2A'
        }
      ],
      sessionsByStatus: {
        scheduled: 14,
        ongoing: 1,
        completed: 3,
        cancelled: 0
      },
      usersByRole: {
        admin: 1,
        teacher: 8,
        student: 16
      }
    });
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Render pie chart labels
  const renderPieLabel = useCallback(({ name, percent }: PieLabelProps) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <Typography variant="h4" gutterBottom component={motion.h4} variants={itemVariants}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Statistics
              </Typography>
              <Grid container spacing={3}>
                {stats && Object.entries(stats.counts).map(([key, value]) => (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">{value}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="h6" gutterBottom>
                Users by Role
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderPieLabel}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="h6" gutterBottom>
                Session Statuses
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={sessionStatusData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Upcoming Exams */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Exams
              </Typography>
              {stats && stats.upcomingSessions.length > 0 ? (
                <List>
                  {stats.upcomingSessions.map((session, index) => (
                    <React.Fragment key={session.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{session.subject}</Typography>
                              <Chip 
                                label={new Date(session.date).toLocaleDateString()} 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }} 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Time: {session.time} | Room: {session.classroom}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="textSecondary">
                                Groups: {session.groups}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < stats.upcomingSessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1">No upcoming exams scheduled.</Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default React.memo(AdminDashboard);
