import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography, Grid, Paper, Box, Card, CardContent,
  CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent,
  IconButton, Table, TableBody, TableCell, TableContainer, TableRow,
  Button, Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../config';
import { DashboardStats } from '../../types';
import { getStatusColor, getStatusDisplayText, processSessionStatus } from '../../utils/sessionStatus';



// We now use the utility function from sessionStatus.ts

// Interface for session details
interface SessionDetails {
  id: string;
  subject: string;
  date: string;
  time: string;
  classroom: string;
  groups: string;
  status: string;
  calculatedStatus?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  supervisors?: string;
  examDuration?: number;
  sections?: string;
  originalData?: any;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Removed search and filter states - moved to Schedule Generation

  // Edit and delete states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  // Function to fetch sessions from the API
  const fetchSessions = useCallback(async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Store the raw data

        return response.data.data.map((session: any) => {
          // Create a formatted session object for display in the list
          const formattedSession = {
            id: session._id,
            subject: `${session.subject.name} (${session.subject.code})`,
            date: new Date(session.date).toISOString(),
            time: `${session.startTime} - ${session.endTime}`,
            classroom: session.classroom.roomNumber,
            groups: session.groups.map((g: any) => g.name).join(', '),
            // Use the status field for exam type
            status: session.status && ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'].includes(session.status)
              ? session.status
              : 'examen_principal',
            // Format additional data for the dialog
            examDuration: session.examDuration,
            supervisors: session.supervisors?.map((s: any) => s.user?.name || 'Unknown').join(', ') || '',
            sections: session.sections?.map((s: any) => s.name || s).join(', ') || '',
            // Store the complete original data
            originalData: session
          };

          return formattedSession;
        });
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      // Error fetching sessions
      return [];
    }
  }, []);

  // Handler for closing the session details dialog
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedSession(null);
  }, []);

  // Removed unused handlers - moved to Schedule Generation

  // Handler for confirming session deletion
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(`${API_URL}/api/sessions/${sessionToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Session deleted successfully

        // Show success message
        setSnackbar({
          open: true,
          message: 'Session deleted successfully',
          severity: 'success'
        });

        // Refresh dashboard data
        fetchDashboardData();
      } else {
        throw new Error(response.data.message || 'Failed to delete session');
      }
    } catch (error: any) {
      // Error deleting session
      setSnackbar({
        open: true,
        message: `Error deleting session: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  // Handler for closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Removed filterSessions function - moved to Schedule Generation

  // Modified code to format and calculate status for upcoming sessions
  const formatSessionData = useCallback((sessions: any[]) => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return sessions.map(session => {
      if (!session) return session;

      // Handle different session time formats
      let startTime = '';
      let endTime = '';

      if (session.time && typeof session.time === 'string') {
        // Extract time parts from the time string "startTime - endTime"
        const timeParts = session.time.split(' - ');
        startTime = timeParts[0] || '';
        endTime = timeParts[1] || '';
      } else {
        // If time is not in expected format, try to use startTime and endTime directly
        startTime = session.startTime || '';
        endTime = session.endTime || '';
      }

      // Process the session to ensure it has the correct status properties
      return processSessionStatus(session);
    });
  }, []);



  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch dashboard stats
      const statsResponse = await axios.get(`${API_URL}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Fetch sessions separately to ensure we have the latest data
      const sessions = await fetchSessions();

      if (statsResponse.data.success) {
        // Process dashboard data

        // Process session data to calculate current status
        const processedSessions = formatSessionData(sessions);

        // Create modified data with the latest sessions
        const modifiedData = {
          ...statsResponse.data.data,
          upcomingSessions: processedSessions
        };

        // Now count sessions by calculated status
        const calculatedSessionsByStatus = {
          scheduled: processedSessions.filter((s: any) => s.status === 'scheduled').length,
          ongoing: processedSessions.filter((s: any) => s.status === 'ongoing').length,
          completed: processedSessions.filter((s: any) => s.status === 'completed').length,
          cancelled: processedSessions.filter((s: any) => s.status === 'cancelled').length
        };

        modifiedData.sessionsByStatus = calculatedSessionsByStatus;

        setStats(modifiedData);
        setError(null);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (error: any) {
      // Error fetching dashboard data
      setError(error.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, [fetchSessions, formatSessionData]);

  useEffect(() => {
    fetchDashboardData();

    // Optional: Set up a refresh interval for real-time dashboard updates
    const refreshInterval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes

    return () => {
      clearInterval(refreshInterval); // Clean up on unmount
    };
  }, [fetchDashboardData]);

  // Removed filter application useEffect - moved to Schedule Generation

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
                {stats && Object.entries(stats.counts).map(([key, value]) => {
                  // Make sure value is a primitive type (string or number)
                  const displayValue = typeof value === 'object' ?
                    (Array.isArray(value) ? (value as any[]).length : JSON.stringify(value)) :
                    String(value);

                  return (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">{displayValue}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </motion.div>
        </Grid>



        {/* Upcoming Exams section completely removed */}
      </Grid>

      {/* Session Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Session Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession && (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>Subject</TableCell>
                    <TableCell>{selectedSession.subject}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell>{selectedSession.date}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell>{selectedSession.time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Classroom</TableCell>
                    <TableCell>{selectedSession.classroom}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Groups</TableCell>
                    <TableCell>{selectedSession.groups}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          selectedSession.status === 'devoir_surveille' ? 'Devoir Surveillé' :
                          selectedSession.status === 'examen_tp' ? 'Examen TP' :
                          selectedSession.status === 'examen_principal' ? 'Examen Principal' :
                          selectedSession.status === 'examen_rattrapage' ? 'Examen Rattrapage' :
                          // If we don't have a specific exam type, show a default value
                          'Non spécifié'
                        }
                        color={
                          selectedSession.status === 'devoir_surveille' ? 'info' :
                          selectedSession.status === 'examen_tp' ? 'secondary' :
                          selectedSession.status === 'examen_principal' ? 'primary' :
                          selectedSession.status === 'examen_rattrapage' ? 'warning' :
                          'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplayText(selectedSession.status || 'scheduled')}
                        color={getStatusColor(selectedSession.status || 'scheduled')}
                      />
                    </TableCell>
                  </TableRow>
                  {selectedSession.supervisors && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Supervisors</TableCell>
                      <TableCell>{selectedSession.supervisors}</TableCell>
                    </TableRow>
                  )}
                  {selectedSession.sections && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Sections</TableCell>
                      <TableCell>{selectedSession.sections}</TableCell>
                    </TableRow>
                  )}
                  {selectedSession.examDuration && selectedSession.examDuration > 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Exam Duration</TableCell>
                      <TableCell>{selectedSession.examDuration} minutes</TableCell>
                    </TableRow>
                  )}
                  {selectedSession.originalData && selectedSession.originalData.createdAt && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                      <TableCell>{new Date(selectedSession.originalData.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  {selectedSession.originalData && selectedSession.originalData.notes && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                      <TableCell>{selectedSession.originalData.notes}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Session
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {sessionToEdit && (
            <Typography variant="body1">
              This feature is currently under development. You will be able to edit session details here soon.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default React.memo(AdminDashboard);
