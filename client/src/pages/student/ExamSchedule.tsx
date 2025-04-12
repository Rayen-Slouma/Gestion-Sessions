import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent,
  TextField, MenuItem, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Alert, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CalendarMonth as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Event as EventIcon,
  Room as RoomIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { format, parseISO, isValid, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { getExamTypeDisplayName, getStatusDisplayName, getStatusColor, isExamType } from '../../utils/examTypeUtils';

interface Exam {
  _id: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  examDuration: number;
  classroom: {
    _id: string;
    roomNumber: string;
    building: string;
    department?: string;
    floor?: number;
  };
  groups: any[];
  supervisors: any[];
  status: string;
  type?: string;
  examType?: string;
  originalStatus?: string;
}

const ExamSchedule: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarData, setCalendarData] = useState<Record<string, Exam[]>>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  const [studentProfile, setStudentProfile] = useState<{ section?: string, group?: string } | null>(null);

  // Fetch student profile
  const fetchStudentProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/api/students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        setStudentProfile({
          section: response.data.data.section?._id,
          group: response.data.data.group?._id
        });
      }
    } catch (error) {
      // Error fetching student profile
      // Don't set error state here as it would interfere with the exam list display
    }
  }, []);

  // Fetch exams from API
  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {

        // Process each exam to ensure it has the correct examType
        const processedExams = response.data.data.map((exam: Exam) => {
          // Store the original status
          const originalStatus = exam.status;

          // Check if the status is an exam type
          const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
          const isExamType = examTypes.includes(originalStatus);

          if (isExamType) {
            // If the status is an exam type, set examType to the original status
            return {
              ...exam,
              examType: originalStatus,
              originalStatus
            };
          }

          return exam;
        });


        setExams(processedExams);
        setFilteredExams(processedExams);

        // Organize exams by date for calendar view
        const examsByDate: Record<string, Exam[]> = {};
        processedExams.forEach((exam: Exam) => {
          const dateKey = exam.date.split('T')[0];
          if (!examsByDate[dateKey]) {
            examsByDate[dateKey] = [];
          }
          examsByDate[dateKey].push(exam);
        });
        setCalendarData(examsByDate);
      } else {
        throw new Error(response.data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      // Error fetching exams
      setError('Failed to load exam schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch student profile on component mount
  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  // Fetch exams when profile changes or component mounts
  useEffect(() => {
    fetchExams();
  }, [fetchExams, studentProfile]);

  // Filter exams based on search term, date, and status
  useEffect(() => {
    let result = [...exams];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        exam =>
          exam.subject?.name?.toLowerCase().includes(term) ||
          exam.subject?.code?.toLowerCase().includes(term) ||
          exam.classroom?.roomNumber?.toLowerCase().includes(term)
      );
    }

    // Filter by date
    if (selectedDate && isValid(selectedDate)) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      result = result.filter(exam => exam.date.startsWith(dateString));
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter(exam => exam.status === selectedStatus);
    }

    setFilteredExams(result);
  }, [exams, searchTerm, selectedDate, selectedStatus]);

  // Handle opening exam details dialog
  const handleExamClick = (exam: Exam) => {
    setSelectedExam(exam);
    setDialogOpen(true);
  };

  // Handle closing exam details dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setSelectedStatus('');
  };

  // Generate enhanced calendar view with week/month options
  const generateCalendarView = () => {
    if (!exams.length) return null;

    // Get days for the current view (week or month)
    const days = getDaysForView();

    return (
      <Card variant="outlined" sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
        <CardContent sx={{ p: 2 }}>
          {/* Calendar controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              Calendar Overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ChevronLeftIcon />}
                onClick={navigateToPrevious}
              >
                {calendarView === 'week' ? 'Previous Week' : 'Previous Month'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={navigateToToday}
                startIcon={<TodayIcon />}
              >
                Today
              </Button>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ChevronRightIcon />}
                onClick={navigateToNext}
              >
                {calendarView === 'week' ? 'Next Week' : 'Next Month'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={calendarView === 'week' ? <ViewModuleIcon /> : <ViewWeekIcon />}
                onClick={toggleCalendarView}
              >
                {calendarView === 'week' ? 'Month View' : 'Week View'}
              </Button>
            </Box>
          </Box>

          {/* Calendar header - days of week */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Box
                key={day}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  p: 1,
                  bgcolor: 'primary.light',
                  color: 'white',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = new Date().toDateString() === date.toDateString();
              const exams = getExamsForDay(date);
              const hasExams = exams.length > 0;

              return (
                <Box
                  key={index}
                  onClick={() => handleDayClick(date)}
                  sx={{
                    width: '14.28%',
                    aspectRatio: '1/1',
                    p: 1,
                    borderRight: index % 7 !== 6 ? '1px solid #e0e0e0' : 'none',
                    borderBottom: calendarView === 'month' && index < 35 ? '1px solid #e0e0e0' : 'none',
                    bgcolor: isToday ? 'rgba(59, 130, 246, 0.1)' : isCurrentMonth ? 'white' : '#f5f5f5',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(59, 130, 246, 0.05)'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isCurrentMonth ? 'text.primary' : 'text.secondary',
                      mb: 1
                    }}
                  >
                    {date.getDate()}
                  </Typography>

                  {/* Exam indicators */}
                  {hasExams && (
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      {exams.slice(0, 3).map((exam) => (
                        <Box
                          key={exam._id}
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'white',
                            borderRadius: 1,
                            p: 0.5,
                            mb: 0.5,
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExamClick(exam);
                          }}
                        >
                          {exam.subject?.name} ({exam.startTime})
                        </Box>
                      ))}
                      {exams.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{exams.length - 3} plus...
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Get status color for chips
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'Planifié':
      case 'devoir_surveille':
      case 'examen_tp':
      case 'examen_principal':
      case 'examen_rattrapage':
        return 'primary';
      case 'ongoing':
      case 'En cours':
        return 'success';
      case 'completed':
      case 'Terminé':
        return 'default';
      case 'cancelled':
      case 'Annulé':
        return 'error';
      default:
        return 'primary';
    }
  };

  // Check if status is an exam type
  const isExamType = (status: string) => {
    const result = [
      'devoir_surveille',
      'examen_tp',
      'examen_principal',
      'examen_rattrapage',
      'controle_continu',
      'examen_final',
      'rattrapage',
      'tp'
    ].includes(status);
    return result;
  };

  // Get exam type name in French
  const getExamTypeName = (type: string) => {

    let result;
    switch (type) {
      case 'devoir_surveille':
        result = 'Devoir Surveillé';
        break;
      case 'examen_tp':
        result = 'Examen TP';
        break;
      case 'examen_principal':
        result = 'Examen Principal';
        break;
      case 'examen_rattrapage':
        result = 'Examen Rattrapage';
        break;
      case 'controle_continu':
        result = 'Contrôle Continu';
        break;
      case 'examen_final':
        result = 'Examen Final';
        break;
      case 'rattrapage':
        result = 'Rattrapage';
        break;
      case 'tp':
        result = 'TP';
        break;
      default:
        result = type || 'Non Spécifié';
    }

    return result;
  };

  // Get exam status name in French
  const getExamStatusName = (status: string) => {
    // If it's an exam type, return 'Planifié' as the status
    if (isExamType(status)) {
      return 'Planifié';
    }

    // Otherwise, return the actual status in French
    switch (status) {
      case 'scheduled':
        return 'Planifié';
      case 'ongoing':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Calendar navigation functions
  const navigateToPrevious = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleCalendarView = () => {
    setCalendarView(calendarView === 'week' ? 'month' : 'week');
  };

  // Helper function to get days for the current view (week or month)
  const getDaysForView = () => {
    const days = [];

    if (calendarView === 'week') {
      // Get the start of the week (Sunday)
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());

      // Generate 7 days for the week
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        days.push(day);
      }
    } else {
      // Get the first day of the month
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Get the first day of the first week (might be from previous month)
      const firstDay = new Date(monthStart);
      firstDay.setDate(firstDay.getDate() - firstDay.getDay());

      // Generate 42 days (6 weeks) to ensure we cover the whole month
      for (let i = 0; i < 42; i++) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() + i);
        days.push(day);
      }
    }

    return days;
  };

  // Helper function to get exams for a specific day
  const getExamsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarData[dateKey] || [];
  };

  // Handle day click in calendar
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    // Filter exams for this day
    const dateString = format(date, 'yyyy-MM-dd');
    const dayExams = exams.filter(exam => exam.date.startsWith(dateString));
    setFilteredExams(dayExams);
    // Switch to list view to show the filtered exams
    setViewMode('list');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1e40af' }}>
          Exam Schedule
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          View and manage your upcoming exams
        </Typography>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Filter by date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleResetFilters}
                startIcon={<FilterListIcon />}
                sx={{ height: '40px' }}
              >
                Reset Filters
              </Button>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                startIcon={viewMode === 'list' ? <CalendarIcon /> : <FilterListIcon />}
                sx={{ height: '40px' }}
              >
                {viewMode === 'list' ? 'Calendar View' : 'List View'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Exam Schedule Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : filteredExams.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>No exams found matching your criteria.</Alert>
        ) : viewMode === 'calendar' ? (
          generateCalendarView()
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Classroom</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Exam Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow
                    key={exam._id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleExamClick(exam)}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {exam.subject?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exam.subject?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(exam.date)}
                    </TableCell>
                    <TableCell>
                      {exam.startTime} - {exam.endTime}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {exam.examDuration} minutes
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Room {exam.classroom?.roomNumber}
                      </Typography>
                      {(exam.classroom?.department || exam.classroom?.floor) && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {exam.classroom?.department && `Dept: ${exam.classroom.department}`}
                          {exam.classroom?.department && exam.classroom?.floor && ' | '}
                          {exam.classroom?.floor && `Floor: ${exam.classroom.floor}`}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {exam.examType ? getExamTypeName(exam.examType) : 'Regular Exam'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getExamStatusName(exam.status)}
                        size="small"
                        color={getStatusColor(exam.status) as any}
                      />
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </motion.div>

      {/* Exam Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedExam && (
          <>
            <DialogTitle sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Exam Details
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e40af', mb: 0.5 }}>
                  {selectedExam.subject?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Subject Code: {selectedExam.subject?.code}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Card elevation={0} sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <EventIcon sx={{ color: '#3b82f6', mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatDate(selectedExam.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card elevation={0} sx={{ bgcolor: 'rgba(139, 92, 246, 0.05)', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <TimeIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Time
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {selectedExam.startTime} - {selectedExam.endTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Duration: {selectedExam.examDuration} minutes
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card elevation={0} sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)', mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <RoomIcon sx={{ color: '#3b82f6', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Room {selectedExam.classroom?.roomNumber}
                      </Typography>
                      {(selectedExam.classroom?.department || selectedExam.classroom?.floor) && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {selectedExam.classroom?.department && `Department: ${selectedExam.classroom.department}`}
                          {selectedExam.classroom?.department && selectedExam.classroom?.floor && ' | '}
                          {selectedExam.classroom?.floor && `Floor: ${selectedExam.classroom.floor}`}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Exam Type
                    </Typography>
                    <Chip
                      label={selectedExam.examType ? getExamTypeName(selectedExam.examType) : 'Regular Exam'}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Status
                    </Typography>
                    <Chip
                      label={getExamStatusName(selectedExam.status)}
                      color={getStatusColor(selectedExam.status) as any}
                    />
                  </Box>
                </Grid>
              </Grid>


            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ExamSchedule;
