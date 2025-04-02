import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, 
  IconButton, Card, CardContent, Grid
} from '@mui/material';
import { Event as CalendarIcon } from '@mui/icons-material';

interface SupervisionSession {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  classroom: string;
  groups: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

const SupervisionSchedule: React.FC = () => {
  const [sessions, setSessions] = useState<SupervisionSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, fetch supervision schedule from API
    const fetchSupervisionSchedule = async () => {
      try {
        // Mock data for demonstration
        setSessions([
          {
            id: '1',
            subject: 'Computer Science 101',
            date: '2023-06-15',
            startTime: '09:00',
            endTime: '11:00',
            classroom: 'B12',
            groups: ['CS-1A', 'CS-1B'],
            status: 'scheduled'
          },
          {
            id: '2',
            subject: 'Programming Fundamentals',
            date: '2023-06-16',
            startTime: '12:00',
            endTime: '14:00',
            classroom: 'A5',
            groups: ['CS-1C'],
            status: 'scheduled'
          },
          {
            id: '3',
            subject: 'Database Systems',
            date: '2023-06-18',
            startTime: '15:00',
            endTime: '17:00',
            classroom: 'C3',
            groups: ['CS-2A', 'CS-2B'],
            status: 'scheduled'
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching supervision schedule:', error);
        setLoading(false);
      }
    };

    fetchSupervisionSchedule();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'ongoing': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getDaysBetween = (): string[] => {
    // Mock data for calendar overview
    return ['2023-06-15', '2023-06-16', '2023-06-17', '2023-06-18', '2023-06-19'];
  };

  const getSessionsForDay = (date: string): SupervisionSession[] => {
    return sessions.filter(session => session.date === date);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Supervision Schedule
      </Typography>
      
      {loading ? (
        <Typography>Loading schedule...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Calendar Overview
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {getDaysBetween().map(day => (
                      <Card key={day} sx={{ width: 120, textAlign: 'center', mb: 1 }}>
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}
                          </Typography>
                          <Typography variant="body1">
                            {new Date(day).getDate()}
                          </Typography>
                          {getSessionsForDay(day).length > 0 ? (
                            <Chip 
                              size="small" 
                              label={`${getSessionsForDay(day).length} exams`} 
                              color="primary" 
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="No exams" 
                              variant="outlined" 
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Classroom</TableCell>
                    <TableCell>Groups</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.subject}</TableCell>
                      <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                      <TableCell>{`${session.startTime} - ${session.endTime}`}</TableCell>
                      <TableCell>{session.classroom}</TableCell>
                      <TableCell>{session.groups.join(', ')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={session.status} 
                          color={getStatusColor(session.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" title="Add to calendar">
                          <CalendarIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No supervision assignments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SupervisionSchedule;
