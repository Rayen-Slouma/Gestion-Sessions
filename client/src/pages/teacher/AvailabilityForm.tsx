import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip,
  FormControl, InputLabel, MenuItem, Select, SelectChangeEvent,
  TextField, Alert, Snackbar, IconButton, Tabs, Tab, Divider,
  Card, CardContent, CircularProgress, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface SpecialOccasion {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`availability-tabpanel-${index}`}
      aria-labelledby={`availability-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AvailabilityForm: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);

  // Regular availability states
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Special occasions states
  const [specialOccasions, setSpecialOccasions] = useState<SpecialOccasion[]>([]);
  const [specialDate, setSpecialDate] = useState('');
  const [specialStartTime, setSpecialStartTime] = useState('');
  const [specialEndTime, setSpecialEndTime] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [reason, setReason] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'regular' | 'special'} | null>(null);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch regular availability
        const availabilityResponse = await axios.get(`${API_URL}/api/teachers/me/availability`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (availabilityResponse.data.success) {
          // Transform the data to include id for UI operations
          const availabilityData = availabilityResponse.data.data.map((item: any) => ({
            ...item,
            id: item._id || Date.now().toString() + Math.random().toString(36).substring(2, 9)
          }));
          setAvailabilities(availabilityData);
        }

        // Fetch special occasions
        const specialOccasionsResponse = await axios.get(`${API_URL}/api/teachers/me/special-occasions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (specialOccasionsResponse.data.success) {
          // Transform the data to include id for UI operations
          const specialOccasionsData = specialOccasionsResponse.data.data.map((item: any) => ({
            ...item,
            id: item._id || Date.now().toString() + Math.random().toString(36).substring(2, 9)
          }));
          setSpecialOccasions(specialOccasionsData);
        }
      } catch (error: any) {
        // Error fetching availability data
        setError(error.response?.data?.message || 'Failed to fetch availability data');

        // Use mock data for demonstration if API fails
        setAvailabilities([
          { id: '1', day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { id: '2', day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
          { id: '3', day: 'Friday', startTime: '10:00', endTime: '15:00' }
        ]);

        setSpecialOccasions([
          {
            id: '1',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '14:00',
            isAvailable: false,
            reason: 'Medical appointment'
          },
          {
            id: '2',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            startTime: '13:00',
            endTime: '17:00',
            isAvailable: true,
            reason: 'Available for extra supervision'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  // Regular availability handlers
  const handleAddAvailability = () => {
    if (!day || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    // Check for overlapping time slots
    const isOverlapping = availabilities.some(
      avail => avail.day === day &&
      ((startTime >= avail.startTime && startTime < avail.endTime) ||
       (endTime > avail.startTime && endTime <= avail.endTime) ||
       (startTime <= avail.startTime && endTime >= avail.endTime))
    );

    if (isOverlapping) {
      setError('This time slot overlaps with an existing availability');
      return;
    }

    const newAvailability: Availability = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      day,
      startTime,
      endTime
    };

    setAvailabilities([...availabilities, newAvailability]);

    // Reset form
    setDay('');
    setStartTime('');
    setEndTime('');
    setError(null);
  };

  // Special occasions handlers
  const handleAddSpecialOccasion = () => {
    if (!specialDate || !specialStartTime || !specialEndTime || !reason) {
      setError('Please fill in all fields');
      return;
    }

    if (specialStartTime >= specialEndTime) {
      setError('Start time must be before end time');
      return;
    }

    // Check if date is in the past
    const selectedDate = new Date(specialDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Cannot add special occasions for past dates');
      return;
    }

    // Check for overlapping special occasions
    const isOverlapping = specialOccasions.some(
      occasion => occasion.date === specialDate &&
      ((specialStartTime >= occasion.startTime && specialStartTime < occasion.endTime) ||
       (specialEndTime > occasion.startTime && specialEndTime <= occasion.endTime) ||
       (specialStartTime <= occasion.startTime && specialEndTime >= occasion.endTime))
    );

    if (isOverlapping) {
      setError('This time slot overlaps with an existing special occasion');
      return;
    }

    const newSpecialOccasion: SpecialOccasion = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: specialDate,
      startTime: specialStartTime,
      endTime: specialEndTime,
      isAvailable,
      reason
    };

    setSpecialOccasions([...specialOccasions, newSpecialOccasion]);

    // Reset form
    setSpecialDate('');
    setSpecialStartTime('');
    setSpecialEndTime('');
    setIsAvailable(false);
    setReason('');
    setError(null);
  };

  // Delete handlers with confirmation
  const handleDeleteConfirmation = (id: string, type: 'regular' | 'special') => {
    setItemToDelete({ id, type });
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'regular') {
      setAvailabilities(availabilities.filter(avail => avail.id !== itemToDelete.id));
    } else {
      setSpecialOccasions(specialOccasions.filter(occasion => occasion.id !== itemToDelete.id));
    }

    setConfirmDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save regular availability
      const availabilityResponse = await axios.put(
        `${API_URL}/api/teachers/me/availability`,
        { availability: availabilities.map(({ id, ...rest }) => rest) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Save special occasions
      const specialOccasionsResponse = await axios.put(
        `${API_URL}/api/teachers/me/special-occasions`,
        { specialOccasions: specialOccasions.map(({ id, ...rest }) => rest) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (availabilityResponse.data.success && specialOccasionsResponse.data.success) {
        setSuccess(true);
      } else {
        setError('Some changes could not be saved. Please try again.');
      }
    } catch (error: any) {
      // Error saving availability data
      setError(error.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3b82f6' }} gutterBottom>
          Set Availability
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
          Manage your regular weekly availability and special occasions
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="availability tabs"
                sx={{ '& .MuiTab-root': { fontWeight: 600 } }}
              >
                <Tab
                  icon={<ScheduleIcon />}
                  iconPosition="start"
                  label="Weekly Schedule"
                  id="availability-tab-0"
                  aria-controls="availability-tabpanel-0"
                />
                <Tab
                  icon={<EventIcon />}
                  iconPosition="start"
                  label="Special Occasions"
                  id="availability-tab-1"
                  aria-controls="availability-tabpanel-1"
                />
              </Tabs>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1 }} /> Add Weekly Availability
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Set your regular weekly availability for exam supervision. These time slots will be considered when scheduling exams.
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="day-label">Day</InputLabel>
                        <Select
                          labelId="day-label"
                          id="day"
                          value={day}
                          label="Day"
                          onChange={(e) => setDay(e.target.value)}
                        >
                          {days.map((d) => (
                            <MenuItem key={d} value={d}>{d}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleAddAvailability}
                        startIcon={<AddIcon />}
                      >
                        Add Time Slot
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} /> Current Weekly Availability
                  </Typography>

                  {availabilities.length === 0 ? (
                    <Alert severity="info">
                      No availability set. Please add your available time slots above.
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availabilities.map((avail) => (
                        <Chip
                          key={avail.id}
                          label={`${avail.day}: ${avail.startTime} - ${avail.endTime}`}
                          onDelete={() => handleDeleteConfirmation(avail.id, 'regular')}
                          deleteIcon={<DeleteIcon />}
                          color="primary"
                          variant="outlined"
                          sx={{ m: 0.5, borderRadius: 2 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1 }} /> Add Special Occasion
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add specific dates when your availability differs from your regular schedule.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={specialDate}
                        onChange={(e) => setSpecialDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={specialStartTime}
                        onChange={(e) => setSpecialStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={specialEndTime}
                        onChange={(e) => setSpecialEndTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 300 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={isAvailable ? "Available" : "Unavailable"}
                        sx={{ height: '100%', display: 'flex' }}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Medical appointment"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleAddSpecialOccasion}
                        startIcon={<AddIcon />}
                      >
                        Add Special Occasion
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} /> Special Occasions
                  </Typography>

                  {specialOccasions.length === 0 ? (
                    <Alert severity="info">
                      No special occasions set. Add specific dates when your availability differs from your regular schedule.
                    </Alert>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {specialOccasions
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((occasion) => (
                          <Paper
                            key={occasion.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderColor: occasion.isAvailable ? 'success.light' : 'error.light',
                              borderWidth: 1,
                              borderRadius: 2
                            }}
                          >
                            <Grid container alignItems="center">
                              <Grid item xs={12} md={3}>
                                <Typography variant="subtitle1">
                                  {formatDate(occasion.date)}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <Typography variant="body2">
                                  {occasion.startTime} - {occasion.endTime}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <Chip
                                  label={occasion.isAvailable ? "Available" : "Unavailable"}
                                  color={occasion.isAvailable ? "success" : "error"}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary">
                                  {occasion.reason}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteConfirmation(occasion.id, 'special')}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </Box>
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCancelDelete}
          aria-labelledby="delete-confirmation-dialog"
        >
          <DialogTitle id="delete-confirmation-dialog">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              Confirm Deletion
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this {itemToDelete?.type === 'regular' ? 'availability slot' : 'special occasion'}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
            Availability settings saved successfully!
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
};

export default AvailabilityForm;
