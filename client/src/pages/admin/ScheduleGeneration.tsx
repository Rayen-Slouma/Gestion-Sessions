import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Button, 
  Alert, Snackbar, CircularProgress, Divider,
  Card, CardContent, CardHeader, List, ListItem, ListItemText,
  Tabs, Tab, FormControl, InputLabel, MenuItem, Select,
  TextField, OutlinedInput, Checkbox,
  ListItemAvatar, Avatar, InputAdornment, IconButton, Popover, ListItemButton, Chip
} from '@mui/material';
import { 
  ClassOutlined, 
  GroupOutlined, 
  SubjectOutlined, 
  SupervisedUserCircleOutlined, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon, 
  ArrowDropUp as ArrowDropUpIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import ExamScheduleCreator from '../../components/schedule/ExamScheduleCreator';
import GraphicalExamScheduleCreator from '../../components/schedule/GraphicalExamScheduleCreator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
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

// Interface definitions
interface Subject {
  _id: string;
  name: string;
  code: string;
  examDuration: number;
}

interface Classroom {
  _id: string;
  roomNumber: string;
  building: string;
  capacity: number;
}

interface Group {
  _id: string;
  name: string;
  size: number;
  section: {
    name: string;
  };
}

interface Teacher {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  department: string;
}

interface SessionFormData {
  subject: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  classroom: string;
  groups: string[];
  supervisors: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  renderOption,
  getOptionLabel,
  searchPlaceholder = "Search...",
  startIcon = null
}: {
  label: string;
  options: any[];
  value: string;
  onChange: (value: string) => void;
  renderOption?: (option: any) => React.ReactNode;
  getOptionLabel: (option: any) => string;
  searchPlaceholder?: string;
  startIcon?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const anchorRef = useRef<HTMLDivElement>(null);
  
  const handleToggle = () => setOpen(prev => !prev);
  
  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };
  
  const filteredOptions = options.filter(option => 
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedOption = options.find(option => option._id === value);
  
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        ref={anchorRef}
        onClick={handleToggle}
        value={selectedOption ? getOptionLabel(selectedOption) : ''}
        label={label}
        startAdornment={startIcon}
        readOnly
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              edge="end"
              onClick={handleToggle}
              size="small"
            >
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: { width: anchorRef.current?.clientWidth, maxHeight: 400 }
        }}
      >
        <Box p={1}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Box>
        <Divider />
        <List sx={{ pt: 0, maxHeight: 320, overflow: 'auto' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <ListItemButton
                key={option._id}
                onClick={() => {
                  onChange(option._id);
                  setOpen(false);
                }}
                selected={value === option._id}
              >
                {renderOption ? renderOption(option) : (
                  <ListItemText primary={getOptionLabel(option)} />
                )}
              </ListItemButton>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No results found" />
            </ListItem>
          )}
        </List>
      </Popover>
    </FormControl>
  );
};

const MultiSearchableSelect = ({
  label,
  options,
  value,
  onChange,
  renderOption,
  getOptionLabel,
  searchPlaceholder = "Search...",
  renderValue,
}: {
  label: string;
  options: any[];
  value: string[];
  onChange: (value: string[]) => void;
  renderOption?: (option: any, checked: boolean) => React.ReactNode;
  getOptionLabel: (option: any) => string;
  searchPlaceholder?: string;
  renderValue: (selected: string[]) => React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const anchorRef = useRef<HTMLDivElement>(null);
  
  const handleToggle = () => setOpen(prev => !prev);
  
  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };
  
  const filteredOptions = options.filter(option => 
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleToggleOption = (optionId: string) => {
    const currentIndex = value.indexOf(optionId);
    const newValue = [...value];
    
    if (currentIndex === -1) {
      newValue.push(optionId);
    } else {
      newValue.splice(currentIndex, 1);
    }
    
    onChange(newValue);
  };
  
  // Generate a placeholder text based on selection count
  const getDisplayText = () => {
    if (value.length === 0) return '';
    if (value.length === 1) {
      const selectedOption = options.find(o => o._id === value[0]);
      return selectedOption ? getOptionLabel(selectedOption) : '1 item selected';
    }
    return `${value.length} items selected`;
  };
  
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        ref={anchorRef}
        onClick={handleToggle}
        value={getDisplayText()}
        label={label}
        readOnly
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              edge="end"
              onClick={handleToggle}
              size="small"
            >
              {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
      {value.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {renderValue(value)}
        </Box>
      )}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: { width: anchorRef.current?.clientWidth, maxHeight: 400 }
        }}
      >
        <Box p={1}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Box>
        <Divider />
        <List sx={{ pt: 0, maxHeight: 320, overflow: 'auto' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <ListItemButton
                key={option._id}
                onClick={() => handleToggleOption(option._id)}
                selected={value.indexOf(option._id) !== -1}
              >
                {renderOption ? renderOption(option, value.indexOf(option._id) !== -1) : (
                  <>
                    <Checkbox checked={value.indexOf(option._id) !== -1} />
                    <ListItemText primary={getOptionLabel(option)} />
                  </>
                )}
              </ListItemButton>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No results found" />
            </ListItem>
          )}
        </List>
      </Popover>
    </FormControl>
  );
};

const ScheduleGeneration: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [graphicalMode, setGraphicalMode] = useState(false);

  // Automatic generation state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailySlots] = useState([
    { startTime: '09:00', endTime: '11:00' },
    { startTime: '12:00', endTime: '14:00' },
    { startTime: '15:00', endTime: '17:00' }
  ]);
  
  // Manual session creation state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  
  const [sessionForm, setSessionForm] = useState<SessionFormData>({
    subject: '',
    date: null,
    startTime: '09:00',
    endTime: '11:00',
    classroom: '',
    groups: [],
    supervisors: [],
    status: 'scheduled'
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch resources for manual session creation
  useEffect(() => {
    if (tabValue === 1) {
      fetchResources();
    }
  }, [tabValue]);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      // Mock data for subjects
      const subjectsResponse = [
        { _id: '1', name: 'Computer Science 101', code: 'CS101', examDuration: 120 },
        { _id: '2', name: 'Mathematics 201', code: 'MATH201', examDuration: 180 },
        { _id: '3', name: 'Physics 110', code: 'PHYS110', examDuration: 120 },
        { _id: '4', name: 'Database Systems', code: 'CS305', examDuration: 150 },
        { _id: '5', name: 'Artificial Intelligence', code: 'CS401', examDuration: 180 }
      ];
      
      // Mock data for classrooms
      const classroomsResponse = [
        { _id: '1', roomNumber: 'A101', building: 'Main Building', capacity: 50 },
        { _id: '2', roomNumber: 'B205', building: 'Science Building', capacity: 30 },
        { _id: '3', roomNumber: 'C310', building: 'Engineering Building', capacity: 40 },
        { _id: '4', roomNumber: 'D102', building: 'Computer Building', capacity: 25 }
      ];
      
      // Mock data for groups
      const groupsResponse = [
        { _id: '1', name: 'CS-1A', size: 25, section: { name: 'CS-1' } },
        { _id: '2', name: 'CS-1B', size: 25, section: { name: 'CS-1' } },
        { _id: '3', name: 'MATH-2A', size: 20, section: { name: 'MATH-2' } },
        { _id: '4', name: 'ENG-1A', size: 30, section: { name: 'ENG-1' } }
      ];
      
      // Mock data for teachers
      const teachersResponse = [
        { _id: '1', user: { name: 'Dr. Johnson', email: 'johnson@example.com' }, department: 'Computer Science' },
        { _id: '2', user: { name: 'Prof. Smith', email: 'smith@example.com' }, department: 'Mathematics' },
        { _id: '3', user: { name: 'Dr. Williams', email: 'williams@example.com' }, department: 'Physics' }
      ];

      setSubjects(subjectsResponse);
      setClassrooms(classroomsResponse);
      setGroups(groupsResponse);
      setTeachers(teachersResponse);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources for session creation');
    }
    setLoadingResources(false);
  };

  // Handle automatic schedule generation
  const handleGenerateSchedule = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate schedule');
      setLoading(false);
    }
  };

  // Handle form input changes for manual session
  const handleFormChange = (field: keyof SessionFormData, value: any) => {
    setSessionForm({
      ...sessionForm,
      [field]: value
    });
  };

  // Handle session creation submission
  const handleCreateSession = async () => {
    // Validate form
    if (!sessionForm.subject || !sessionForm.date || !sessionForm.classroom || 
        sessionForm.groups.length === 0 || sessionForm.supervisors.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format date for API
      const formattedDate = format(sessionForm.date, 'yyyy-MM-dd');
      
      // For demonstration, we're just logging the formatted date
      console.log(`Creating exam on ${formattedDate}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful creation
      setSessionForm({
        subject: '',
        date: null,
        startTime: '09:00',
        endTime: '11:00',
        classroom: '',
        groups: [],
        supervisors: [],
        status: 'scheduled'
      });
      
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session');
      setLoading(false);
    }
  };

  // Find selected subject details
  const selectedSubject = subjects.find(sub => sub._id === sessionForm.subject);

  // Calculate recommended end time based on subject duration
  useEffect(() => {
    if (sessionForm.subject && selectedSubject) {
      // Parse start time
      const [hours, minutes] = sessionForm.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0);
      
      // Add exam duration
      const endDate = new Date(startDate.getTime() + selectedSubject.examDuration * 60 * 1000);
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      
      // Update end time
      setSessionForm(prevForm => ({
        ...prevForm,
        endTime: `${endHours}:${endMinutes}`
      }));
    }
  }, [sessionForm.subject, sessionForm.startTime, selectedSubject]);

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Exam Schedule Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="schedule generation options">
            <Tab label="Automatic Generation" id="schedule-tab-0" />
            <Tab label="Manual Session Creation" id="schedule-tab-1" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Generate New Schedule
                </Typography>
                <Typography variant="body2" paragraph>
                  Select the date range for the exam period. The system will automatically
                  create an optimal schedule based on teacher availability, classroom capacity,
                  and subject requirements.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDate={startDate || undefined}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Daily Time Slots
                    </Typography>
                    {dailySlots.map((slot, index) => (
                      <Typography key={index} variant="body2">
                        Slot {index + 1}: {slot.startTime} - {slot.endTime}
                      </Typography>
                    ))}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleGenerateSchedule}
                      disabled={loading || !startDate || !endDate}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Generate Schedule'}
                    </Button>
                  </Grid>
                  
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Scheduling Constraints" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Teacher Availability" 
                        secondary="Schedule respects teacher availability periods and maximum exams per day"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Classroom Capacity" 
                        secondary="Assigns appropriate rooms based on group size and room capacity"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Exam Spacing" 
                        secondary="Ensures appropriate time between exams for the same student groups"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Subject Priority" 
                        secondary="Schedules more complex subjects with more groups earlier in the period"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Button onClick={() => setGraphicalMode(!graphicalMode)}>
            Toggle Graphical Mode
          </Button>
          {!graphicalMode && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create Exam Session
              </Typography>
              
              {loadingResources ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 2 }}>
                      <SearchableSelect 
                        label="Subject *"
                        options={subjects}
                        value={sessionForm.subject}
                        onChange={(value) => handleFormChange('subject', value)}
                        getOptionLabel={(subject) => `${subject.name} (${subject.code})`}
                        searchPlaceholder="Search subjects..."
                        startIcon={sessionForm.subject ? <SubjectOutlined sx={{ color: 'primary.main', mr: 1 }} /> : null}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Exam Date *"
                      value={sessionForm.date}
                      onChange={(newValue) => handleFormChange('date', newValue)}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          margin: 'normal'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Start Time *"
                      type="time"
                      value={sessionForm.startTime}
                      onChange={(e) => handleFormChange('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="End Time *"
                      type="time"
                      value={sessionForm.endTime}
                      onChange={(e) => handleFormChange('endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      helperText={selectedSubject ? `Recommended duration: ${selectedSubject.examDuration} minutes` : ''}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 2 }}>
                      <SearchableSelect 
                        label="Classroom *"
                        options={classrooms}
                        value={sessionForm.classroom}
                        onChange={(value) => handleFormChange('classroom', value)}
                        getOptionLabel={(classroom) => `${classroom.roomNumber} (${classroom.building}, Capacity: ${classroom.capacity})`}
                        searchPlaceholder="Search classrooms..."
                        startIcon={sessionForm.classroom ? <ClassOutlined sx={{ color: 'primary.main', mr: 1 }} /> : null}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="status-select-label">Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        id="status-select"
                        value={sessionForm.status}
                        label="Status"
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="ongoing">Ongoing</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <MultiSearchableSelect 
                        label="Student Groups *"
                        options={groups}
                        value={sessionForm.groups}
                        onChange={(value) => handleFormChange('groups', value)}
                        getOptionLabel={(group) => `${group.name} (${group.section.name})`}
                        searchPlaceholder="Search groups..."
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const group = groups.find(g => g._id === value);
                              return (
                                <Chip 
                                  key={value}
                                  label={group ? `${group.name} (${group.section.name})` : value}
                                  icon={<GroupOutlined />} 
                                />
                              );
                            })}
                          </Box>
                        )}
                        renderOption={(group, checked) => (
                          <>
                            <Checkbox checked={checked} />
                            <ListItemText primary={group.name} secondary={`${group.section.name} - Size: ${group.size}`} />
                          </>
                        )}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <MultiSearchableSelect 
                        label="Supervisors *"
                        options={teachers}
                        value={sessionForm.supervisors}
                        onChange={(value) => handleFormChange('supervisors', value)}
                        getOptionLabel={(teacher) => `${teacher.user.name} (${teacher.department})`}
                        searchPlaceholder="Search supervisors..."
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const teacher = teachers.find(t => t._id === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={teacher ? teacher.user.name : value} 
                                  icon={<SupervisedUserCircleOutlined />}
                                />
                              );
                            })}
                          </Box>
                        )}
                        renderOption={(teacher, checked) => (
                          <>
                            <Checkbox checked={checked} />
                            <ListItemAvatar>
                              <Avatar>{teacher.user.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={teacher.user.name} secondary={teacher.department} />
                          </>
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        sx={{ mr: 2 }}
                        onClick={() => {
                          setSessionForm({
                            subject: '',
                            date: null,
                            startTime: '09:00',
                            endTime: '11:00',
                            classroom: '',
                            groups: [],
                            supervisors: [],
                            status: 'scheduled'
                          });
                        }}
                      >
                        Clear Form
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateSession}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Create Exam Session'}
                      </Button>
                    </Box>
                  </Grid>
                  
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                    </Grid>
                  )}
                </Grid>
              )}
            </Paper>
          )}
          {graphicalMode && <GraphicalExamScheduleCreator />}
        </TabPanel>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {tabValue === 0 ? 'Exam schedule successfully generated!' : tabValue === 1 ? 'Exam session successfully created!' : 'Graphical schedule successfully updated!'}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default ScheduleGeneration;
