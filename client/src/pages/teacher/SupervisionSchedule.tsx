import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
  IconButton, Card, CardContent, Grid, CircularProgress,
  TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Button, SelectChangeEvent, TablePagination, Alert,
  OutlinedInput, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import { Event as CalendarIcon, Search as SearchIcon, FilterList as FilterListIcon,
  Clear as ClearIcon, Refresh as RefreshIcon, Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Today as TodayIcon, ViewWeek as ViewWeekIcon, ViewModule as ViewModuleIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { getStatusColor, getStatusDisplayText } from '../../utils/sessionStatus';

interface SupervisionSession {
  _id: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  examDuration?: number;
  classroom: {
    _id: string;
    roomNumber: string;
    department?: {
      _id: string;
      name: string;
    };
  };
  groups: Array<{
    _id: string;
    name: string;
    section?: {
      _id: string;
      name: string;
    };
  }>;
  status: string;
  examType?: string;
  notes?: string;
  supervisors: Array<{
    _id: string;
    user?: {
      name: string;
      email?: string;
    };
    name?: string;
    email?: string;
  }>;
}

const SupervisionSchedule: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState<SupervisionSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SupervisionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('');

  // Session details dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SupervisionSession | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user || !user._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSessions(response.data.data);
        setFilteredSessions(response.data.data);
      } else {
        setError('Failed to fetch supervision schedule');
      }
    } catch (error: any) {
      // Error fetching supervision schedule
      setError(error.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Filter sessions based on search query and filters
  const filterSessions = useCallback(() => {
    if (!sessions.length) return [];

    let result = [...sessions];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(session =>
        (session.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.subject?.code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.classroom?.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.groups?.some(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(session => session.status === statusFilter);
    }

    // Filter by exam type
    if (examTypeFilter !== 'all') {
      result = result.filter(session => session.examType === examTypeFilter);
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter(session => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === dateFilter;
      });
    }

    setFilteredSessions(result);
    setPage(0); // Reset to first page when filters change
  }, [sessions, searchQuery, statusFilter, examTypeFilter, dateFilter]);

  // Effect to fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Effect to filter sessions when filters change
  useEffect(() => {
    filterSessions();
  }, [filterSessions]);

  // Event handlers for filters and pagination
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  const handleExamTypeFilterChange = (e: SelectChangeEvent) => {
    setExamTypeFilter(e.target.value);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setExamTypeFilter('all');
    setDateFilter('');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchSessions();
  };

  // Session details dialog handlers
  const handleOpenDialog = (session: SupervisionSession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSession(null);
  };

  // Calendar state and functions
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  // Get days for the current week or month view
  const getDaysForView = useCallback((): Date[] => {
    const days: Date[] = [];
    const startDate = new Date(currentDate);

    if (calendarView === 'week') {
      // Set to the beginning of the week (Sunday)
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);

      // Get 7 days (full week)
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
    } else {
      // Set to the first day of the month
      startDate.setDate(1);

      // Get the first day of the month
      const firstDay = startDate.getDay();

      // Add days from previous month to fill the first week
      const prevMonthDays = new Date(startDate);
      prevMonthDays.setDate(0); // Last day of previous month
      const daysInPrevMonth = prevMonthDays.getDate();

      for (let i = firstDay - 1; i >= 0; i--) {
        const date = new Date(prevMonthDays);
        date.setDate(daysInPrevMonth - i);
        days.push(date);
      }

      // Add days of current month
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(startDate);
        date.setDate(i);
        days.push(date);
      }

      // Add days from next month to complete the grid (6 rows x 7 columns = 42 cells)
      const remainingDays = 42 - days.length;
      const nextMonthDate = new Date(startDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      nextMonthDate.setDate(1);

      for (let i = 0; i < remainingDays; i++) {
        const date = new Date(nextMonthDate);
        date.setDate(nextMonthDate.getDate() + i);
        days.push(date);
      }
    }

    return days;
  }, [currentDate, calendarView]);

  // Navigate to previous/next period
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

  // Format date to string for filtering
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get sessions for a specific day
  const getSessionsForDay = (date: Date): SupervisionSession[] => {
    const dateString = formatDateToString(date);
    return sessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === dateString;
    });
  };

  // Handle day click to filter sessions
  const handleDayClick = (date: Date) => {
    const dateString = formatDateToString(date);
    setDateFilter(dateString);
    // Automatically apply the filter
    const filtered = sessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      return sessionDate === dateString;
    });
    setFilteredSessions(filtered);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#3b82f6' }}>
              Supervision Schedule
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              View your upcoming exam supervision assignments
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 2 }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="search-sessions">Search</InputLabel>
                  <OutlinedInput
                    id="search-sessions"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    }
                    endAdornment={
                      searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="clear search"
                            onClick={() => setSearchQuery('')}
                            edge="end"
                            size="small"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                    label="Search"
                    placeholder="Search by subject, code, classroom, or group"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="exam-type-filter-label">Exam Type</InputLabel>
                  <Select
                    labelId="exam-type-filter-label"
                    id="exam-type-filter"
                    value={examTypeFilter}
                    label="Exam Type"
                    onChange={handleExamTypeFilterChange}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="devoir_surveille">Devoir Surveillé</MenuItem>
                    <MenuItem value="examen_tp">Examen TP</MenuItem>
                    <MenuItem value="examen_principal">Examen Principal</MenuItem>
                    <MenuItem value="examen_rattrapage">Examen Rattrapage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  id="date-filter"
                  label="Date"
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              </Grid>
              {filteredSessions.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No sessions found with the current filters. Try adjusting your search criteria.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </motion.div>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
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
                    {getDaysForView().map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = new Date().toDateString() === date.toDateString();
                      const sessions = getSessionsForDay(date);
                      const hasExams = sessions.length > 0;

                      return (
                        <Box
                          key={index}
                          onClick={() => handleDayClick(date)}
                          sx={{
                            width: calendarView === 'week' ? '14.28%' : '14.28%',
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

                          {hasExams && (
                            <Box sx={{ mt: 'auto' }}>
                              <Chip
                                size="small"
                                label={`${sessions.length} exam${sessions.length > 1 ? 's' : ''}`}
                                color="primary"
                                sx={{
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.7rem'
                                  }
                                }}
                              />
                            </Box>
                          )}

                          {/* Indicator dots for exams */}
                          {hasExams && sessions.length > 1 && (
                            <Box sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              display: 'flex',
                              gap: 0.5
                            }}>
                              {sessions.slice(0, 3).map((session, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: getStatusColor(session.status) + '.main'
                                  }}
                                />
                              ))}
                              {sessions.length > 3 && (
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>+{sessions.length - 3}</Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Selected date info */}
                  {dateFilter && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Sessions on {new Date(dateFilter).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>
                      {filteredSessions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No sessions scheduled for this day.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {filteredSessions.map((session) => (
                            <Chip
                              key={session._id}
                              label={`${session.subject?.name} (${session.startTime})`}
                              color={getStatusColor(session.status)}
                              size="small"
                              onClick={() => handleOpenDialog(session)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
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
                      <TableCell>Session Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSessions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((session) => (
                        <TableRow
                          key={session._id}
                          hover
                          onClick={() => handleOpenDialog(session)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{session.subject?.name} ({session.subject?.code})</TableCell>
                          <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                          <TableCell>{`${session.startTime} - ${session.endTime}`}</TableCell>
                          <TableCell>{session.classroom?.roomNumber}</TableCell>
                          <TableCell>{session.groups?.map(g => g.name).join(', ')}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusDisplayText(session.status)}
                              color={getStatusColor(session.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusDisplayText(session.examType || 'examen_principal')}
                              color="secondary"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredSessions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No supervision assignments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSessions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </motion.div>
        </>
      )}

      {/* Session Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Session Details
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
                      Subject
                    </TableCell>
                    <TableCell>{selectedSession?.subject?.name} ({selectedSession?.subject?.code})</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Date
                    </TableCell>
                    <TableCell>{selectedSession?.date ? new Date(selectedSession.date).toLocaleDateString() : ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Time
                    </TableCell>
                    <TableCell>{selectedSession?.startTime || ''} - {selectedSession?.endTime || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Duration
                    </TableCell>
                    <TableCell>{selectedSession?.examDuration || 120} minutes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Classroom
                    </TableCell>
                    <TableCell>{selectedSession?.classroom?.roomNumber || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Groups
                    </TableCell>
                    <TableCell>{selectedSession?.groups?.map(g => g.name).join(', ') || ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Supervisors
                    </TableCell>
                    <TableCell>
                      {selectedSession?.supervisors?.map(s => s.user?.name).join(', ') || 'None assigned'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Exam Type
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplayText(selectedSession?.examType || 'examen_principal')}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplayText(selectedSession?.status || 'scheduled')}
                        size="small"
                        color={getStatusColor(selectedSession?.status || 'scheduled')}
                      />
                    </TableCell>
                  </TableRow>
                  {selectedSession?.notes && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Notes
                      </TableCell>
                      <TableCell>{selectedSession?.notes}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupervisionSchedule;
