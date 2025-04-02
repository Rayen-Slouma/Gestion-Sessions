import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, 
  FormControl, InputLabel, MenuItem, Select,
  TextField, Alert, Snackbar, IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

const AvailabilityForm: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, fetch teacher's availability from API
    const fetchAvailability = async () => {
      try {
        // Mock data for demonstration
        setAvailabilities([
          { id: '1', day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { id: '2', day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
          { id: '3', day: 'Friday', startTime: '10:00', endTime: '15:00' }
        ]);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, []);

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
      id: Date.now().toString(),
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

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(avail => avail.id !== id));
  };

  const handleSubmit = async () => {
    try {
      // In a real application, save availability to API
      // await axios.put(`${API_URL}/api/teachers/me/availability`, { 
      //   availability: availabilities.map(({ id, ...rest }) => rest) 
      // });
      
      setSuccess(true);
    } catch (error) {
      console.error('Error saving availability:', error);
      setError('Failed to save availability. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Set Availability
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Availability
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={2}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleAddAvailability}
            >
              Add
            </Button>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Availability
        </Typography>
        
        {availabilities.length === 0 ? (
          <Typography variant="body1">
            No availability set. Please add your available time slots above.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availabilities.map((avail) => (
              <Chip
                key={avail.id}
                label={`${avail.day}: ${avail.startTime}-${avail.endTime}`}
                onDelete={() => handleDeleteAvailability(avail.id)}
                deleteIcon={<DeleteIcon />}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}
      </Paper>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={availabilities.length === 0}
      >
        Save Availability
      </Button>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Availability saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvailabilityForm;
