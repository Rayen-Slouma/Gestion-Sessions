import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  List, ListItem, ListItemText, Divider, Chip, CircularProgress
} from '@mui/material';
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
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Exams
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography variant="body2" color="error">{error}</Typography>
            ) : upcomingExams.length === 0 ? (
              <Typography variant="body2">No upcoming exams scheduled.</Typography>
            ) : (
              <List>
                {upcomingExams.map((exam, index) => (
                  <React.Fragment key={exam._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {exam.subject?.name} ({exam.subject?.code})
                            </Typography>
                            <Chip 
                              size="small" 
                              label={exam.status} 
                              color={exam.status === 'scheduled' ? 'primary' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {new Date(exam.date).toLocaleDateString()} at {exam.startTime} - {exam.endTime}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2">
                              Room: {exam.classroom?.roomNumber}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < upcomingExams.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Group
                  </Typography>
                  <Typography variant="body1" component="div">
                    <strong>Group:</strong> {groupInfo.group}
                    <br />
                    <strong>Section:</strong> {groupInfo.section}
                    <br />
                    <strong>Semester:</strong> {groupInfo.semester}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exam Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Total Exams" 
                        secondary={`${upcomingExams.length} exams scheduled this semester`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText 
                        primary="Next Exam" 
                        secondary={
                          upcomingExams.length > 0 
                            ? `${upcomingExams[0]?.subject?.name}, ${new Date(upcomingExams[0]?.date).toLocaleDateString()}` 
                            : "No exams scheduled"
                        }
                      />
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

export default React.memo(StudentDashboard);
