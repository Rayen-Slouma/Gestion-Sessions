import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, Grid, Card, CardContent
} from '@mui/material';
import { CalendarMonth as CalendarIcon, Schedule as ScheduleIcon, Room as RoomIcon } from '@mui/icons-material';

interface Exam {
  id: string;
  subject: string;
  code: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  supervisors: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

const ExamSchedule: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, fetch exam schedule from API
    const fetchExamSchedule = async () => {
      try {
        // Mock data for demonstration
        setExams([
          {
            id: '1',
            subject: 'Computer Science 101',
            code: 'CS101',
            date: '2023-06-15',
            startTime: '09:00',
            endTime: '11:00',
            room: 'B12',
            supervisors: ['Dr. Johnson', 'Prof. Smith'],
            status: 'scheduled'
          },
          {
            id: '2',
            subject: 'Mathematics 201',
            code: 'MATH201',
            date: '2023-06-16',
            startTime: '12:00',
            endTime: '14:00',
            room: 'A5',
            supervisors: ['Dr. Williams'],
            status: 'scheduled'
          },
          {
            id: '3',
            subject: 'Physics 110',
            code: 'PHYS110',
            date: '2023-06-17',
            startTime: '15:00',
            endTime: '17:00',
            room: 'C3',
            supervisors: ['Dr. Brown', 'Prof. Davis'],
            status: 'scheduled'
          },
          {
            id: '4',
            subject: 'English Composition',
            code: 'ENG101',
            date: '2023-06-20',
            startTime: '10:00',
            endTime: '12:00',
            room: 'D8',
            supervisors: ['Prof. Wilson'],
            status: 'scheduled'
          },
          {
            id: '5',
            subject: 'Introduction to Psychology',
            code: 'PSY100',
            date: '2023-06-22',
            startTime: '13:00',
            endTime: '15:00',
            room: 'E2',
            supervisors: ['Dr. Taylor'],
            status: 'scheduled'
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exam schedule:', error);
        setLoading(false);
      }
    };

    fetchExamSchedule();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getExamCountdown = (examDate: string): string => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Exam passed';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow!';
    return `${diffDays} days`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Exam Schedule
      </Typography>
      
      {loading ? (
        <Typography>Loading schedule...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1">Next Exam</Typography>
                    <Typography variant="h6">{exams[0]?.subject}</Typography>
                    <Typography variant="body2">
                      {new Date(exams[0]?.date).toLocaleDateString()} ({getExamCountdown(exams[0]?.date)})
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="subtitle1">Exam Period</Typography>
                    <Typography variant="h6">
                      {exams.length > 0 ? (
                        `${new Date(exams[0]?.date).toLocaleDateString()} - ${new Date(exams[exams.length - 1]?.date).toLocaleDateString()}`
                      ) : (
                        'No exams scheduled'
                      )}
                    </Typography>
                    <Typography variant="body2">Total: {exams.length} exams</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <RoomIcon sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
                  <Box>
                    <Typography variant="subtitle1">Exam Locations</Typography>
                    <Typography variant="body1">
                      {Array.from(new Set(exams.map(exam => exam.room))).join(', ')}
                    </Typography>
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
                    <TableCell>Code</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Supervisors</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.subject}</TableCell>
                      <TableCell>{exam.code}</TableCell>
                      <TableCell>
                        {new Date(exam.date).toLocaleDateString()}
                        <Typography variant="caption" display="block" color="textSecondary">
                          {getExamCountdown(exam.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>{`${exam.startTime} - ${exam.endTime}`}</TableCell>
                      <TableCell>{exam.room}</TableCell>
                      <TableCell>{exam.supervisors.join(', ')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={exam.status} 
                          color={getStatusColor(exam.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {exams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No exams scheduled.
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

export default ExamSchedule;
