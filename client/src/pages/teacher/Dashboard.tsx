import React, { useContext, useEffect, useState, useCallback } from 'react';
import { 
  Box, Typography, Grid, Paper, Card, CardContent, 
  List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config';
import { ExamSession } from '../../types';

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
      console.error('Error fetching dashboard data:', error);
      setError('Error connecting to the server');
      setUpcomingSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Exam Supervision
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography variant="body2" color="error">{error}</Typography>
            ) : upcomingSessions.length === 0 ? (
              <Typography variant="body2">No upcoming exam supervisions scheduled.</Typography>
            ) : (
              <List>
                {upcomingSessions.map((session, index) => (
                  <React.Fragment key={session._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${session.subject?.name} (${session.subject?.code})`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {new Date(session.date).toLocaleDateString()} at {session.startTime} - {session.endTime}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Room: {session.classroom?.roomNumber} | 
                              Groups: {session.groups?.map(g => g.name).join(', ')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < upcomingSessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Availability Status
                  </Typography>
                  <Typography variant="body1">
                    You have set your availability for the upcoming exam period.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Links
                  </Typography>
                  <List>
                    <ListItem button component="a" href="/teacher/availability">
                      <ListItemText primary="Update Availability" />
                    </ListItem>
                    <ListItem button component="a" href="/teacher/supervision">
                      <ListItemText primary="View Supervision Schedule" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(TeacherDashboard);
