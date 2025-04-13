import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import {
  Box, Typography, Paper, Fab, Tooltip, Grid, Button, Divider,
  Tabs, Tab, CircularProgress, Card, CardContent, CardHeader,
  List, ListItem, ListItemText, FormControl, InputLabel, MenuItem,
  Select, TextField, Checkbox, ListItemAvatar, Avatar, Chip,
  OutlinedInput, InputAdornment, IconButton, Popover, Alert, Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ClassOutlined,
  GroupOutlined,
  SubjectOutlined,
  SupervisedUserCircleOutlined,
  FolderOutlined,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
  department?: string;
  floor?: number;
  capacity: number;
}

interface Group {
  _id: string;
  name: string;
  size: number;
  section: {
    _id: string;
    name: string;
  };
  subjects: Array<string | { _id: string; name: string; code: string }>;
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
  status: 'devoir_surveille' | 'examen_tp' | 'examen_principal' | 'examen_rattrapage' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  examDuration?: number;
  sections: string[];
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
              aria-label="toggle dropdown"
              onClick={handleToggle}
              edge="end"
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
          style: { width: anchorRef.current?.clientWidth, maxHeight: 300, overflow: 'auto' },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            autoFocus
            placeholder={searchPlaceholder}
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
        <List dense>
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <ListItem
              key={option._id}
              button
              onClick={() => {
                onChange(option._id);
                setOpen(false);
              }}
              selected={option._id === value}
            >
              {renderOption ? renderOption(option) : (
                <ListItemText primary={getOptionLabel(option)} />
              )}
            </ListItem>
          )) : (
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
  renderValue
}: {
  label: string;
  options: any[];
  value: string[];
  onChange: (value: string[]) => void;
  renderOption?: (option: any, checked: boolean) => React.ReactNode;
  getOptionLabel: (option: any) => string;
  searchPlaceholder?: string;
  renderValue?: (selected: string[]) => React.ReactNode;
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

  const filteredOptions = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        ref={anchorRef}
        onClick={handleToggle}
        value={value.length > 0 && !renderValue ? value.join(', ') : ''}
        label={label}
        readOnly
        sx={{
          '& .MuiInputBase-input': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          '& .MuiInputBase-inputAdornedStart': {
            marginLeft: 1
          }
        }}
        startAdornment={
          value.length > 0 && renderValue ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                maxWidth: 'calc(100% - 32px)',
                overflow: 'hidden',
                py: 0.5
              }}
            >
              {renderValue(value)}
            </Box>
          ) : null
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle dropdown"
              onClick={handleToggle}
              edge="end"
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
          style: { width: anchorRef.current?.clientWidth, maxHeight: 300, overflow: 'auto' },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TextField
            autoFocus
            placeholder={searchPlaceholder}
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchTerm('')}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
        <List dense>
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <ListItem
              key={option._id}
              button
              onClick={() => handleToggleOption(option._id)}
            >
              {renderOption ? renderOption(option, value.includes(option._id)) : (
                <>
                  <Checkbox checked={value.includes(option._id)} />
                  <ListItemText primary={getOptionLabel(option)} />
                </>
              )}
            </ListItem>
          )) : (
            <ListItem>
              <ListItemText primary="No results found" />
            </ListItem>
          )}
        </List>
      </Popover>
    </FormControl>
  );
};

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

const SessionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editSessionId = queryParams.get('edit');

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(!!editSessionId);
  const [editingSession, setEditingSession] = useState<any>(null);

  // Tab state
  const [tabValue, setTabValue] = useState(1); // Default to manual creation tab when editing
  const [graphicalMode, setGraphicalMode] = useState(false);

  // Automatic generation state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const handleCloseError = () => setError(null);

  // State for warning alerts
  const [warningAlerts, setWarningAlerts] = useState({
    noSections: true,
    noGroups: true,
    noSubjects: true,
    noClassrooms: true,
    noSupervisors: true
  });

  const handleCloseWarning = (warningKey: keyof typeof warningAlerts) => {
    setWarningAlerts(prev => ({
      ...prev,
      [warningKey]: false
    }));
  };
  const [createdSessions, setCreatedSessions] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning'}>({open: false, message: '', severity: 'success'});
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
  const [sections, setSections] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  const [sessionForm, setSessionForm] = useState<SessionFormData>({
    subject: '',
    date: null,
    startTime: '09:00',
    endTime: '10:00',
    classroom: '',
    groups: [],
    supervisors: [],
    status: 'examen_principal',
    examDuration: 60,
    sections: []
  });

  const handleReturn = () => {
    navigate('/admin/schedule');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to fetch resources for manual session creation
  const fetchResources = useCallback(async () => {
    setLoadingResources(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch subjects from the server
      const subjectsRes = await axios.get(`${API_URL}/api/subjects`, { headers });
      const subjectsData = subjectsRes.data.data;

      // Fetch classrooms from the server
      const classroomsRes = await axios.get(`${API_URL}/api/classrooms`, { headers });
      const classroomsData = classroomsRes.data.data;

      // Fetch groups from the server
      const groupsRes = await axios.get(`${API_URL}/api/groups`, { headers });
      const groupsData = groupsRes.data.data;

      // Fetch teachers from the server
      const teachersRes = await axios.get(`${API_URL}/api/teachers`, { headers });
      const teachersData = teachersRes.data.data;

      // Fetch sections for the section dropdown
      const sectionsRes = await axios.get(`${API_URL}/api/sections`, { headers });
      const sectionsData = sectionsRes.data.data;

      // Fetch all sessions to check for conflicts
      const sessionsRes = await axios.get(`${API_URL}/api/sessions`, { headers });
      const sessionsData = sessionsRes.data.data;

      console.log('Fetched data:', {
        subjects: subjectsData,
        classrooms: classroomsData,
        groups: groupsData,
        teachers: teachersData,
        sections: sectionsData,
        sessions: sessionsData
      });

      setSubjects(subjectsData);
      setClassrooms(classroomsData);
      setGroups(groupsData);
      setTeachers(teachersData);
      setSections(sectionsData);
      setAllSessions(sessionsData);

      // Initialize available resources
      setAvailableClassrooms(classroomsData);
      setAvailableTeachers(teachersData);
      setAvailableGroups(groupsData);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.message || 'Failed to load resources for session creation');
    }
    setLoadingResources(false);
  }, []);

  // Fetch resources for manual session creation when component mounts
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Fetch session data when in edit mode
  useEffect(() => {
    if (editSessionId) {
      fetchSessionForEdit(editSessionId);
    }
  }, [editSessionId, subjects.length, groups.length, classrooms.length, teachers.length]);

  // Function to fetch session data for editing
  const fetchSessionForEdit = async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch session data
      const response = await axios.get(`${API_URL}/api/sessions/${sessionId}`, { headers });
      const sessionData = response.data.data;

      console.log('Session data for edit:', sessionData);
      setEditingSession(sessionData);

      // Wait for resources to be loaded before populating the form
      if (subjects.length === 0 || groups.length === 0 || classrooms.length === 0 || teachers.length === 0) {
        // Resources not loaded yet, wait for them
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (subjects.length > 0 && groups.length > 0 && classrooms.length > 0 && teachers.length > 0) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 500);
        });
      }

      // Populate the form with session data
      // Make sure to handle the date correctly to avoid timezone issues
      let sessionDate = null;
      if (sessionData.date) {
        try {
          // Try to parse the date safely
          sessionDate = new Date(sessionData.date);
          // Validate the date is valid
          if (isNaN(sessionDate.getTime())) {
            console.error('Invalid date from server:', sessionData.date);
            // Create a valid date as fallback
            sessionDate = new Date();
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          // Create a valid date as fallback
          sessionDate = new Date();
        }
      }
      console.log('Original session date:', sessionData.date);
      console.log('Parsed session date for edit:', sessionDate);

      // Ensure groups and supervisors are IDs, not objects
      const groupIds = sessionData.groups.map((group: any) =>
        typeof group === 'string' ? group : group._id
      );

      const supervisorIds = sessionData.supervisors.map((supervisor: any) =>
        typeof supervisor === 'string' ? supervisor : supervisor._id
      );

      // Get section IDs from the groups
      const sectionIds = Array.from(new Set(
        groupIds.map((groupId: string) => {
          const group = groups.find(g => g._id === groupId);
          return group ? group.section._id : null;
        }).filter(Boolean)
      ));

      // Determine the correct status to use
      // If examType exists, use it as the status for the form
      // Otherwise, use the status field
      const examTypes = ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'];
      const statusForForm = sessionData.examType ||
                          (examTypes.includes(sessionData.status) ? sessionData.status : 'examen_principal');

      console.log('Setting session form with status:', statusForForm, 'Original status:', sessionData.status, 'Exam type:', sessionData.examType);

      setSessionForm({
        subject: typeof sessionData.subject === 'string' ? sessionData.subject : sessionData.subject._id,
        date: sessionDate,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        classroom: typeof sessionData.classroom === 'string' ? sessionData.classroom : sessionData.classroom._id,
        groups: groupIds,
        supervisors: supervisorIds,
        status: statusForForm,
        examDuration: sessionData.examDuration,
        sections: sectionIds as string[]
      });

      // Set edit mode
      setIsEditMode(true);
    } catch (err: any) {
      console.error('Error fetching session for edit:', err);
      setError(err.response?.data?.message || 'Failed to load session data for editing');
      setIsEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleFormChange = (field: keyof SessionFormData, value: any) => {
    setSessionForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset relevant warning alerts when form changes
    if (field === 'subject') {
      setWarningAlerts(prev => ({ ...prev, noSections: true }));
    } else if (field === 'groups') {
      setWarningAlerts(prev => ({ ...prev, noSubjects: true, noClassrooms: true }));
    } else if (field === 'date' || field === 'startTime' || field === 'endTime') {
      setWarningAlerts(prev => ({
        ...prev,
        noGroups: true,
        noClassrooms: true,
        noSupervisors: true
      }));
    }
  };

  // Function to check if two time intervals overlap
  const doTimeIntervalsOverlap = (date1: string, start1: string, end1: string, date2: string, start2: string, end2: string) => {
    // Convert dates and times to comparable format
    const dateStr1 = date1.split('T')[0]; // Extract just the date part
    const dateStr2 = date2.split('T')[0];

    // If dates are different, no overlap
    if (dateStr1 !== dateStr2) return false;

    // Convert times to minutes since midnight for easier comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    // Check for overlap
    return (start1Minutes < end2Minutes && end1Minutes > start2Minutes);
  };

  // Function to filter available resources based on selected date and time
  const filterAvailableResources = useCallback(async () => {
    if (!sessionForm.date || !sessionForm.startTime || !sessionForm.endTime) {
      // If no date or time is selected, all resources are available
      setAvailableClassrooms(classrooms);
      setAvailableTeachers(teachers);
      setAvailableGroups(groups);
      return;
    }

    // Validate the date object before using it
    if (!sessionForm.date || isNaN(sessionForm.date.getTime())) {
      console.error('Invalid date object in sessionForm:', sessionForm.date);
      // Use current date as fallback
      sessionForm.date = new Date();
    }

    // Format the date consistently for both create and edit modes
    let formattedDate: string;
    try {
      formattedDate = sessionForm.date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      // Use current date as fallback
      formattedDate = new Date().toISOString().split('T')[0];
    }

    // Log date information for debugging
    console.log('Session form date object:', sessionForm.date);
    console.log('Formatted date string:', formattedDate);
    console.log('Day of week (0=Sunday):', sessionForm.date.getDay());
    console.log('Day name:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][sessionForm.date.getDay()]);

    // We'll fetch available classrooms from the API instead of filtering locally

    // Define a variable to store filtered teachers
    let availableTeachersFiltered: Teacher[] = [];

    try {
      // Fetch available teachers from the API based on date and time
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Build query parameters
      const params = new URLSearchParams({
        date: formattedDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime
      });

      // Add sessionId if in edit mode
      if (isEditMode && editingSession) {
        params.append('sessionId', editingSession._id);
      }

      // Fetch available teachers
      const response = await axios.get(`${API_URL}/api/sessions/available-teachers?${params.toString()}`, { headers });

      if (response.data.success) {
        // Log the availability data for debugging
        console.log('Teacher availability data from API:', response.data.data);

        // Filter teachers to only include those that are available
        availableTeachersFiltered = response.data.data.filter((teacher: any) => teacher.isAvailable);
        console.log('Filtered available teachers:', availableTeachersFiltered);

        // Update the availableTeachers state with only available teachers
        setAvailableTeachers(availableTeachersFiltered);
      } else {
        // Fallback to client-side filtering if API call fails
        availableTeachersFiltered = teachers.filter(teacher => {
          // Check if this teacher is supervising any session that overlaps with the current time slot
          return !allSessions.some(session => {
            // Skip the current session if we're in edit mode
            if (isEditMode && editingSession && session._id === editingSession._id) return false;

            // Check if this teacher is supervising this session and it overlaps with our time slot
            return (
              session.supervisors.some((supervisor: { _id: string }) => supervisor._id === teacher._id) &&
              doTimeIntervalsOverlap(
                formattedDate, sessionForm.startTime, sessionForm.endTime,
                session.date, session.startTime, session.endTime
              )
            );
          });
        });
      }
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      // Fallback to client-side filtering if API call fails
      availableTeachersFiltered = teachers.filter(teacher => {
        // Check if this teacher is supervising any session that overlaps with the current time slot
        return !allSessions.some(session => {
          // Skip the current session if we're in edit mode
          if (isEditMode && editingSession && session._id === editingSession._id) return false;

          // Check if this teacher is supervising this session and it overlaps with our time slot
          return (
            session.supervisors.some((supervisor: { _id: string }) => supervisor._id === teacher._id) &&
            doTimeIntervalsOverlap(
              formattedDate, sessionForm.startTime, sessionForm.endTime,
              session.date, session.startTime, session.endTime
            )
          );
        });
      });
    }

    // Set the filtered teachers (this will be called if the API call failed)
    setAvailableTeachers(availableTeachersFiltered);

    // Fetch available classrooms from API
    try {
      const classroomResponse = await axios.get(`${API_URL}/api/sessions/available-classrooms`, {
        params: {
          date: formattedDate,
          startTime: sessionForm.startTime,
          endTime: sessionForm.endTime,
          sessionId: isEditMode ? editingSession?._id : undefined
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (classroomResponse.data.success) {
        // Log the availability data for debugging
        console.log('Classroom availability data from API:', classroomResponse.data.data);

        // Filter classrooms to only include those that are available
        const availableClassroomsList = classroomResponse.data.data.filter((classroom: any) => classroom.isAvailable);
        setAvailableClassrooms(availableClassroomsList);
      } else {
        // Fallback to all classrooms
        setAvailableClassrooms(classrooms);
      }
    } catch (error) {
      console.error('Error fetching available classrooms:', error);
      // Fallback to all classrooms
      setAvailableClassrooms(classrooms);
    }

    // Filter out groups that already have an exam at this time
    const availableGroupsFiltered = groups.filter(group => {
      // Check if this group has any session that overlaps with the current time slot
      return !allSessions.some(session => {
        // Skip the current session if we're in edit mode
        if (isEditMode && editingSession && session._id === editingSession._id) return false;

        // Check if this group is part of this session and it overlaps with our time slot
        return (
          session.groups.some((sessionGroup: { _id: string }) => sessionGroup._id === group._id) &&
          doTimeIntervalsOverlap(
            formattedDate, sessionForm.startTime, sessionForm.endTime,
            session.date, session.startTime, session.endTime
          )
        );
      });
    });

    // We don't need to set availableClassrooms here since we're doing it in the API call
    setAvailableTeachers(availableTeachersFiltered);
    setAvailableGroups(availableGroupsFiltered);

    // If the currently selected classroom is not available, clear it
    if (sessionForm.classroom && !availableClassrooms.some((c: Classroom) => c._id === sessionForm.classroom)) {
      setSessionForm(prev => ({ ...prev, classroom: '' }));
    }

    // Filter out any selected supervisors who are not available
    const availableSupervisorIds = availableTeachersFiltered.map((t: Teacher) => t._id);
    const filteredSupervisors = sessionForm.supervisors.filter(id => availableSupervisorIds.includes(id));
    if (filteredSupervisors.length !== sessionForm.supervisors.length) {
      setSessionForm(prev => ({ ...prev, supervisors: filteredSupervisors }));
    }

    // Filter out any selected groups who are not available
    const availableGroupIds = availableGroupsFiltered.map(g => g._id);
    const filteredGroups = sessionForm.groups.filter(id => availableGroupIds.includes(id));
    if (filteredGroups.length !== sessionForm.groups.length) {
      setSessionForm(prev => ({ ...prev, groups: filteredGroups }));
    }
  }, [sessionForm.date, sessionForm.startTime, sessionForm.endTime, sessionForm.classroom, sessionForm.supervisors, sessionForm.groups, classrooms, teachers, groups, allSessions, isEditMode, editingSession]);

  // Run the filter whenever date or time changes
  useEffect(() => {
    const applyFilters = async () => {
      await filterAvailableResources();
    };
    applyFilters();
  }, [filterAvailableResources]);

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Send request to generate schedule
      const response = await axios.post(`${API_URL}/api/sessions/generate`, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        dailySlots: dailySlots
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Schedule generated successfully',
          severity: 'success'
        });
        // Navigate back to schedule page to see the generated sessions
        navigate('/admin/schedule');
      } else {
        setError(response.data.message || 'Failed to generate schedule');
      }
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  // Function to check for conflicts within the batch of sessions
  const checkForBatchConflicts = (newSession: any) => {
    // If there are no sessions in the batch yet, there can't be conflicts
    if (createdSessions.length === 0) return { hasConflict: false, message: null };

    // Format the date for comparison
    const newSessionDate = newSession.date;

    // Check for conflicts with each existing session in the batch
    for (const existingSession of createdSessions) {
      // Check if dates are different - if so, no conflict
      if (existingSession.date !== newSessionDate) continue;

      // Check for time overlap
      const hasTimeOverlap = doTimeIntervalsOverlap(
        newSessionDate, newSession.startTime, newSession.endTime,
        existingSession.date, existingSession.startTime, existingSession.endTime
      );

      if (!hasTimeOverlap) continue; // No time overlap, so no conflict

      // Check for classroom conflict
      const hasClassroomConflict = newSession.classroom === existingSession.classroom;

      // Check for group conflicts - compare IDs directly
      const hasGroupConflict = newSession.groups.some((groupId: string) =>
        existingSession.groups.includes(groupId)
      );

      // Check for supervisor conflicts
      const hasSupervisorConflict = newSession.supervisors.some((supervisorId: string) =>
        existingSession.supervisors.includes(supervisorId)
      );

      if (hasClassroomConflict || hasGroupConflict || hasSupervisorConflict) {
        // Get the subject name for the existing session
        const existingSubject = subjects.find((s: Subject) => s._id === existingSession.subject);
        const existingSubjectName = existingSubject ? existingSubject.name : 'Unknown';

        // Build a focused conflict message based on what's actually conflicting
        let conflictMessage = `Time conflict with session "${existingSubjectName}" (${existingSession.startTime} - ${existingSession.endTime}): `;

        // Only include the specific conflicts that are occurring
        if (hasClassroomConflict) {
          const classroom = classrooms.find((c: Classroom) => c._id === newSession.classroom);
          conflictMessage += `Classroom ${classroom ? classroom.roomNumber : 'Unknown'} is already booked for this time slot.`;
          return { hasConflict: true, message: conflictMessage };
        }

        if (hasGroupConflict) {
          // Find conflicting group IDs
          const conflictingGroupIds = newSession.groups.filter((groupId: string) =>
            existingSession.groups.includes(groupId)
          );

          // Get group names from the conflicting IDs
          let groupNamesArray: string[] = [];

          // For each conflicting group ID
          for (const groupId of conflictingGroupIds) {
            // Try to find the group in our groups array
            const group = groups.find((g: Group) => g._id === groupId);

            if (group) {
              // If found, use its name
              groupNamesArray.push(group.name);
            } else {
              // If not found in our array, try to find it in the existing session's full group objects
              const existingSessionGroup = existingSession.groupsNames?.split(', ').find((name: string) =>
                name.includes(groupId)
              );

              if (existingSessionGroup) {
                groupNamesArray.push(existingSessionGroup);
              } else {
                // Last resort - use the ID
                groupNamesArray.push(`Group ID: ${groupId}`);
              }
            }
          }

          const groupNames = groupNamesArray.join(', ');

          conflictMessage += `Group(s) ${groupNames} already have an exam scheduled at this time.`;
          return { hasConflict: true, message: conflictMessage };
        }

        if (hasSupervisorConflict) {
          const conflictingSupervisors = newSession.supervisors.filter((supervisorId: string) =>
            existingSession.supervisors.includes(supervisorId)
          );

          const supervisorNames = conflictingSupervisors.map((supervisorId: string) => {
            const teacher = teachers.find((t: Teacher) => t._id === supervisorId);
            return teacher ? teacher.user?.name || 'Unknown' : 'Unknown';
          }).join(', ');

          conflictMessage += `Supervisor(s) ${supervisorNames} already assigned to another exam at this time.`;
          return { hasConflict: true, message: conflictMessage };
        }
      }
    }

    return { hasConflict: false, message: null };
  };

  // Handle manual session creation or update
  const handleCreateSession = async () => {
    // Validate form
    if (!sessionForm.subject) {
      setError('Please select a subject');
      return;
    }
    if (!sessionForm.date) {
      setError('Please select a date');
      return;
    }
    if (!sessionForm.classroom) {
      setError('Please select a classroom');
      return;
    }
    if (sessionForm.groups.length === 0) {
      setError('Please select at least one group');
      return;
    }
    if (sessionForm.supervisors.length === 0) {
      setError('Please select at least one supervisor');
      return;
    }

    setError(null);

    // Format date for display and API
    // Use toISOString and split to get the correct date without timezone issues
    let formattedDate: string = '';
    if (sessionForm.date) {
      try {
        // Validate the date object
        if (isNaN(sessionForm.date.getTime())) {
          console.error('Invalid date in handleCreateSession:', sessionForm.date);
          setError('Invalid date selected. Please select a valid date.');
          return;
        }
        formattedDate = sessionForm.date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date in handleCreateSession:', error);
        setError('Error processing the selected date. Please try again.');
        return;
      }
    }

    // If in edit mode, update the session directly
    if (isEditMode && editingSession) {
      await updateSession(formattedDate);
      return;
    }

    // Get names for display
    const selectedSubject = subjects.find(s => s._id === sessionForm.subject);
    const selectedClassroom = classrooms.find(c => c._id === sessionForm.classroom);
    const selectedGroups = sessionForm.groups.map(groupId => groups.find(g => g._id === groupId)).filter(Boolean);
    const selectedSupervisors = sessionForm.supervisors.map(supId => teachers.find(t => t._id === supId)).filter(Boolean);

    // Create a session preview object
    const sessionPreview = {
      id: Date.now().toString(), // Temporary ID for the list
      subjectName: selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'Unknown Subject',
      classroomName: selectedClassroom ? `${selectedClassroom.roomNumber} (${selectedClassroom.building})` : 'Unknown Classroom',
      groupsNames: selectedGroups.map(g => g?.name || 'Unknown').join(', '),
      supervisorsNames: selectedSupervisors.map(s => s?.user?.name || 'Unknown').join(', '),
      date: formattedDate,
      startTime: sessionForm.startTime,
      endTime: sessionForm.endTime,
      status: sessionForm.status,
      examDuration: sessionForm.examDuration,
      subject: sessionForm.subject,
      classroom: sessionForm.classroom,
      groups: sessionForm.groups,
      supervisors: sessionForm.supervisors,
      sections: sessionForm.sections,
      // Add the full data for API submission
      fullData: {
        subject: sessionForm.subject,
        date: formattedDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        examDuration: sessionForm.examDuration,
        classroom: sessionForm.classroom,
        groups: sessionForm.groups,
        supervisors: sessionForm.supervisors,
        status: sessionForm.status,
        sections: sessionForm.sections
      }
    };

    // Check for conflicts within the batch
    const { hasConflict, message } = checkForBatchConflicts(sessionPreview.fullData);

    if (hasConflict) {
      setError(message);
      return;
    }

    // Add to the list of created sessions
    setCreatedSessions([...createdSessions, sessionPreview]);

    // Reset form after adding to list
    setSessionForm({
      subject: '',
      date: null,
      startTime: '09:00',
      endTime: '10:00',
      classroom: '',
      groups: [],
      supervisors: [],
      status: 'examen_principal',
      examDuration: 60,
      sections: []
    });

    setSnackbar({
      open: true,
      message: 'Session added to the list',
      severity: 'success'
    });
  };

  // Function to update an existing session
  const updateSession = async (formattedDate: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Prepare session data for update
      const sessionData = {
        subject: sessionForm.subject,
        date: formattedDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        examDuration: sessionForm.examDuration,
        classroom: sessionForm.classroom,
        groups: sessionForm.groups,
        supervisors: sessionForm.supervisors,
        status: sessionForm.status,
        sections: sessionForm.sections
      };

      // Validate the session data before sending
      // First check if the selected supervisors are available
      const params = new URLSearchParams({
        date: formattedDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        sessionId: editingSession._id // Include the current session ID to exclude it from conflict checks
      });

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Get the current supervisors from the editing session
      const currentSupervisorIds = editingSession.supervisors.map((sup: any) => sup._id || sup);

      // Identify new supervisors (added) and removed supervisors
      const newSupervisorIds = sessionForm.supervisors.filter(
        (id: string) => !currentSupervisorIds.includes(id)
      );

      console.log('Current supervisors:', currentSupervisorIds);
      console.log('New supervisors to check:', newSupervisorIds);

      // Fetch available teachers to verify supervisor availability
      const availabilityResponse = await axios.get(
        `${API_URL}/api/sessions/available-teachers?${params.toString()}`,
        { headers }
      );

      if (availabilityResponse.data.success) {
        // Check if all newly added supervisors are available
        const availableTeachers = availabilityResponse.data.data;
        const unavailableSupervisors = [];

        for (const supervisorId of newSupervisorIds) {
          const teacher = availableTeachers.find((t: any) => t._id === supervisorId);
          if (teacher && !teacher.isAvailable) {
            unavailableSupervisors.push({
              id: teacher._id,
              name: teacher.user?.name || 'Unknown',
              reason: teacher.reason
            });
          }
        }

        // If there are unavailable supervisors, show an error
        if (unavailableSupervisors.length > 0) {
          const supervisorNames = unavailableSupervisors.map(sup => sup.name).join(', ');
          setError(`Cannot update session: Some selected supervisors are not available. Unavailable supervisors: ${supervisorNames}`);
          setLoading(false);
          return;
        }
      }

      // Send update request
      const response = await axios.put(
        `${API_URL}/api/sessions/${editingSession._id}`,
        sessionData,
        { headers }
      );

      if (response.data.success) {
        // Check if there are affected supervisors that need to be refreshed
        if (response.data.affectedSupervisors && response.data.affectedSupervisors.length > 0) {
          console.log('Supervisors affected by update:', response.data.affectedSupervisors);
        }

        setSnackbar({
          open: true,
          message: 'Session updated successfully',
          severity: 'success'
        });

        // Reset form and navigate back to schedule page
        setSessionForm({
          subject: '',
          date: null,
          startTime: '09:00',
          endTime: '10:00',
          classroom: '',
          groups: [],
          supervisors: [],
          status: 'examen_principal',
          examDuration: 60,
          sections: []
        });

        // Reset edit mode
        setIsEditMode(false);
        setEditingSession(null);

        // Navigate back to schedule page
        navigate('/admin/schedule');
      } else {
        setError(response.data.message || 'Failed to update session');
      }
    } catch (err: any) {
      console.error('Error updating session:', err);

      // Provide a more detailed error message
      let errorMessage = 'Error connecting to the server';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // If there are unavailable supervisors, add them to the error message
      if (err.response?.data?.unavailableSupervisors) {
        const unavailableSupervisors = err.response.data.unavailableSupervisors;
        const supervisorNames = unavailableSupervisors.map((sup: any) => sup.name).join(', ');
        errorMessage += `. Unavailable supervisors: ${supervisorNames}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to validate all sessions in the batch for conflicts with existing sessions
  const validateAllSessionsForConflicts = async () => {
    if (createdSessions.length === 0) return { valid: true, message: null };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch all existing sessions to check for conflicts
      const response = await axios.get(`${API_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        return { valid: false, message: 'Failed to fetch existing sessions for validation' };
      }

      const existingSessions = response.data.data;

      // Check each session in the batch for conflicts with existing sessions
      for (const session of createdSessions) {
        const sessionDate = session.date;
        const { startTime, endTime, classroom, groups, supervisors } = session;

        // Check for conflicts with existing sessions
        for (const existingSession of existingSessions) {
          // Check if dates are different - if so, no conflict
          if (!doTimeIntervalsOverlap(
            sessionDate, startTime, endTime,
            existingSession.date, existingSession.startTime, existingSession.endTime
          )) continue; // No time overlap, so no conflict

          // Check for classroom conflict
          const hasClassroomConflict = session.classroom === existingSession.classroom._id;

          // Check for group conflicts
          const hasGroupConflict = session.groups.some((groupId: string) =>
            existingSession.groups.some((g: { _id: string }) => g._id === groupId)
          );

          // Check for supervisor conflicts
          const hasSupervisorConflict = session.supervisors.some((supervisorId: string) =>
            existingSession.supervisors.some((s: { _id: string }) => s._id === supervisorId)
          );

          if (hasClassroomConflict || hasGroupConflict || hasSupervisorConflict) {
            // Get the subject name for the session
            const sessionSubject = subjects.find((s: Subject) => s._id === session.subject);
            const sessionSubjectName = sessionSubject ? sessionSubject.name : 'Unknown';

            // Get the subject name for the existing session
            const existingSubjectName = existingSession.subject.name || 'Unknown';

            // Build a focused conflict message based on what's actually conflicting
            let conflictMessage = `Conflict detected: Your session "${sessionSubjectName}" (${startTime} - ${endTime}) conflicts with existing session "${existingSubjectName}" (${existingSession.startTime} - ${existingSession.endTime}): `;

            // Only include the specific conflicts that are occurring
            if (hasClassroomConflict) {
              const classroom = classrooms.find((c: Classroom) => c._id === session.classroom);
              conflictMessage += `Classroom ${classroom ? classroom.roomNumber : 'Unknown'} is already booked for this time slot.`;
              return { valid: false, message: conflictMessage };
            }

            if (hasGroupConflict) {
              // Find conflicting group IDs
              const conflictingGroupIds = session.groups.filter((groupId: string) =>
                existingSession.groups.some((g: { _id: string }) => g._id === groupId)
              );

              // Get group names from the conflicting IDs
              let groupNamesArray: string[] = [];

              // For each conflicting group ID
              for (const groupId of conflictingGroupIds) {
                // Try to find the group in our groups array
                const group = groups.find((g: Group) => g._id === groupId);

                if (group) {
                  // If found, use its name
                  groupNamesArray.push(group.name);
                } else {
                  // Try to find the group in the existing session's groups
                  const existingGroup = existingSession.groups.find((g: any) => g._id === groupId);
                  if (existingGroup && existingGroup.name) {
                    groupNamesArray.push(existingGroup.name);
                  } else {
                    // Last resort - use the ID
                    groupNamesArray.push(`Group ID: ${groupId}`);
                  }
                }
              }

              const groupNames = groupNamesArray.join(', ');

              conflictMessage += `Group(s) ${groupNames} already have an exam scheduled at this time.`;
              return { valid: false, message: conflictMessage };
            }

            if (hasSupervisorConflict) {
              const conflictingSupervisors = session.supervisors.filter((supervisorId: string) =>
                existingSession.supervisors.some((s: { _id: string }) => s._id === supervisorId)
              );

              const supervisorNames = conflictingSupervisors.map((supervisorId: string) => {
                const teacher = teachers.find((t: Teacher) => t._id === supervisorId);
                return teacher ? teacher.user?.name || 'Unknown' : 'Unknown';
              }).join(', ');

              conflictMessage += `Supervisor(s) ${supervisorNames} already assigned to another exam at this time.`;
              return { valid: false, message: conflictMessage };
            }
          }
        }
      }

      return { valid: true, message: null };
    } catch (error) {
      console.error('Error validating sessions:', error);
      return { valid: false, message: 'Error validating sessions for conflicts' };
    }
  };

  // Function to submit all created sessions to the server
  const handleSubmitAllSessions = async () => {
    if (createdSessions.length === 0) {
      setError('No sessions to submit');
      return;
    }

    setLoading(true);
    setError(null);

    // First validate all sessions for conflicts with existing sessions
    const validationResult = await validateAllSessionsForConflicts();
    if (!validationResult.valid) {
      setError(validationResult.message);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Prepare sessions data for submission
      const sessionsData = createdSessions.map(session => session.fullData);

      // Create sessions one by one
      const createdSessionsResults = [];
      let failedCount = 0;

      for (const sessionData of sessionsData) {
        try {
          // Send request to create session
          const response = await axios.post(`${API_URL}/api/sessions`, sessionData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data.success) {
            createdSessionsResults.push(response.data.data);
          } else {
            console.error('Session creation failed:', response.data.message);
            failedCount++;
          }
        } catch (err: any) {
          console.error('Error creating session:', err);
          // Get the specific error message from the server if available
          const errorMessage = err.response?.data?.message || 'Unknown error';
          console.error('Server error message:', errorMessage);

          // If there are unavailable supervisors, log them
          if (err.response?.data?.unavailableSupervisors) {
            console.error('Unavailable supervisors:', err.response.data.unavailableSupervisors);
          }

          failedCount++;
        }
      }

      // Return success if at least one session was created
      if (createdSessionsResults.length > 0) {
        setSnackbar({
          open: true,
          message: `Created ${createdSessionsResults.length} sessions successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
          severity: 'success'
        });
        // Clear the created sessions list
        setCreatedSessions([]);
        // Navigate back to schedule page to see the created sessions
        navigate('/admin/schedule');
      } else {
        setError(`Failed to create any sessions. ${failedCount} session(s) failed validation.`);
      }
    } catch (err: any) {
      console.error('Error creating sessions:', err);
      // Provide a more detailed error message
      let errorMessage = 'Error connecting to the server';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // If there are unavailable supervisors, add them to the error message
      if (err.response?.data?.unavailableSupervisors) {
        const unavailableSupervisors = err.response.data.unavailableSupervisors;
        const supervisorNames = unavailableSupervisors.map((sup: any) => sup.name).join(', ');
        errorMessage += `. Unavailable supervisors: ${supervisorNames}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a session from the created sessions list
  const handleRemoveSession = (sessionId: string) => {
    setCreatedSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter sections based on selected subject
  const getFilteredSections = () => {
    if (!sessionForm.subject) {
      return sections;
    }

    // Find groups that have the selected subject
    const groupsWithSubject = groups.filter(group => {
      if (!group.subjects || group.subjects.length === 0) {
        return false;
      }

      return group.subjects.some(subject => {
        if (typeof subject === 'string') {
          return subject === sessionForm.subject;
        } else if (subject && typeof subject === 'object' && '_id' in subject) {
          return subject._id === sessionForm.subject;
        }
        return false;
      });
    });

    // Get the section IDs from these groups
    const sectionIdsWithDuplicates = groupsWithSubject.map(group => group.section._id);
    // Create a unique array of section IDs
    const sectionIds = Array.from(new Set(sectionIdsWithDuplicates));

    // Return sections that match these IDs
    return sections.filter(section => sectionIds.includes(section._id));
  };

  // Get filtered sections
  const filteredSections = getFilteredSections();

  // Filter groups based on selected sections and subject
  const filteredGroups = groups.filter(group => {
    // If sections are selected, filter by section
    const sectionMatch = sessionForm.sections.length === 0 || sessionForm.sections.includes(group.section._id);

    // If a subject is selected, also filter by subject
    if (sessionForm.subject) {
      if (!group.subjects || group.subjects.length === 0) {
        return false;
      }

      // Check if the group has the selected subject
      const subjectMatch = group.subjects.some(subject => {
        if (typeof subject === 'string') {
          return subject === sessionForm.subject;
        } else if (subject && typeof subject === 'object' && '_id' in subject) {
          return subject._id === sessionForm.subject;
        }
        return false;
      });

      return sectionMatch && subjectMatch;
    }

    return sectionMatch;
  });

  // Find selected subject details
  const selectedSubject = subjects.find(sub => sub._id === sessionForm.subject);

  // Get common subjects between selected groups
  const getCommonSubjects = () => {
    if (sessionForm.groups.length === 0) {
      return subjects;
    }

    // Get the subjects for each selected group
    const selectedGroups = sessionForm.groups.map(groupId =>
      groups.find(g => g._id === groupId)
    ).filter(Boolean);

    if (selectedGroups.length === 0) {
      return subjects;
    }

    // Extract subject IDs from each group
    const groupSubjectIds = selectedGroups.map(group => {
      if (!group) return [];

      if (!group.subjects || group.subjects.length === 0) {
        return [];
      }

      // Convert subjects to IDs if they are objects
      return group.subjects.map(subject => {
        if (typeof subject === 'string') {
          return subject;
        } else if (subject && typeof subject === 'object' && '_id' in subject) {
          return subject._id;
        }
        return '';
      }).filter(id => id !== '');
    });

    // Find common subject IDs across all selected groups
    const commonSubjectIds = groupSubjectIds.reduce((common, current) => {
      if (common.length === 0) return current;
      return common.filter(id => current.includes(id));
    }, [] as string[]);

    // Return subjects that match the common IDs
    return subjects.filter(subject => commonSubjectIds.includes(subject._id));
  };

  // Get filtered subjects based on selected groups
  const filteredSubjects = getCommonSubjects();

  // Get filtered classrooms based on total group size
  const getFilteredClassrooms = () => {
    if (sessionForm.groups.length === 0) {
      return classrooms;
    }

    // Calculate total number of students in selected groups
    const totalStudents = sessionForm.groups.reduce((total, groupId) => {
      const group = groups.find(g => g._id === groupId);
      return total + (group ? group.size : 0);
    }, 0);

    // Return classrooms with sufficient capacity
    return classrooms.filter(classroom => classroom.capacity >= totalStudents);
  };

  // Update end time when start time changes (but don't auto-set duration from subject)
  useEffect(() => {
    if (sessionForm.startTime && sessionForm.examDuration) {
      // Calculate end time based on start time and current exam duration
      const [hours, minutes] = sessionForm.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0);
      const endDate = new Date(startDate.getTime() + sessionForm.examDuration * 60 * 1000);
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

      // Update form with calculated end time only (preserve existing duration)
      setSessionForm(prevForm => ({
        ...prevForm,
        endTime: `${endHours}:${endMinutes}`
      }));
    }
  }, [sessionForm.startTime, sessionForm.examDuration]);

  // Clear selected sections and groups when subject changes
  useEffect(() => {
    if (sessionForm.subject) {
      // Get sections that have groups with this subject
      const validSectionIds = filteredSections.map(section => section._id);

      // Filter out sections that don't have groups with this subject
      const validSelectedSections = sessionForm.sections.filter(sectionId =>
        validSectionIds.includes(sectionId)
      );

      // Get groups that have this subject
      const validGroupIds = filteredGroups.map(group => group._id);

      // Filter out groups that don't have this subject
      const validSelectedGroups = sessionForm.groups.filter(groupId =>
        validGroupIds.includes(groupId)
      );

      // If any sections or groups were filtered out, update the form
      if (validSelectedSections.length !== sessionForm.sections.length ||
          validSelectedGroups.length !== sessionForm.groups.length) {
        setSessionForm(prevForm => ({
          ...prevForm,
          sections: validSelectedSections,
          groups: validSelectedGroups
        }));
      }
    }
  }, [sessionForm.subject, filteredSections, filteredGroups]);

  // Automatically select sections based on selected groups
  useEffect(() => {
    if (sessionForm.groups.length > 0) {
      // Get the sections of the selected groups
      const selectedGroupSections = sessionForm.groups.map(groupId => {
        const group = groups.find(g => g._id === groupId);
        return group ? group.section._id : null;
      }).filter(Boolean) as string[];

      // Create a unique array of section IDs
      const uniqueSectionIds = Array.from(new Set(selectedGroupSections));

      // Add any sections that aren't already selected
      const newSections = [...sessionForm.sections];
      let sectionsChanged = false;

      uniqueSectionIds.forEach(sectionId => {
        if (!newSections.includes(sectionId)) {
          newSections.push(sectionId);
          sectionsChanged = true;
        }
      });

      // Update the form if sections changed
      if (sectionsChanged) {
        setSessionForm(prevForm => ({
          ...prevForm,
          sections: newSections
        }));
      }
    }
  }, [sessionForm.groups, groups]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" gutterBottom>
            Create Exam Session
          </Typography>
          <Tooltip title="Return to Schedule Generation">
            <Fab
              color="primary"
              size="small"
              onClick={handleReturn}
              aria-label="return to schedule"
            >
              <ArrowBackIcon />
            </Fab>
          </Tooltip>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
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
                        <Alert severity="error" onClose={handleCloseError}>{error}</Alert>
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
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" color="primary" fontWeight="500">
                  {isEditMode ? 'Edit Exam Session' : 'Create Exam Session'}
                </Typography>
              </Box>

              {loadingResources ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* First row: Section and Student Groups */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Section & Groups
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <MultiSearchableSelect
                            label="Sections *"
                            options={filteredSections}
                            value={sessionForm.sections}
                            onChange={(value) => handleFormChange('sections', value)}
                            getOptionLabel={(section) => `${section.name} (${section.code})`}
                            searchPlaceholder="Search sections..."
                            renderValue={(selected) =>
                              selected.map((value) => {
                                const section = sections.find(s => s._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={section ? section.name : value}
                                    icon={<FolderOutlined />}
                                    size="small"
                                  />
                                );
                              })
                            }
                            renderOption={(section, checked) => (
                              <>
                                <Checkbox checked={checked} />
                                <ListItemText primary={section.name} secondary={section.code} />
                              </>
                            )}
                          />
                          {sessionForm.subject && filteredSections.length === 0 && warningAlerts.noSections && (
                            <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noSections')}>
                              No sections available for the selected subject.
                            </Alert>
                          )}
                        </Box>
                        <Box>
                          <MultiSearchableSelect
                            label="Student Groups *"
                            options={availableGroups.filter(group => filteredGroups.some(g => g._id === group._id))}
                            value={sessionForm.groups}
                            onChange={(value) => handleFormChange('groups', value)}
                            getOptionLabel={(group) => `${group.name} (${group.section.name})`}
                            searchPlaceholder="Search groups..."
                            renderValue={(selected) =>
                              selected.map((value) => {
                                const group = groups.find(g => g._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={group ? group.name : value}
                                    icon={<GroupOutlined />}
                                    size="small"
                                  />
                                );
                              })
                            }
                            renderOption={(group, checked) => (
                              <>
                                <Checkbox checked={checked} />
                                <ListItemText primary={group.name} secondary={`${group.section.name} - Size: ${group.size}`} />
                              </>
                            )}
                          />
                          {sessionForm.date && sessionForm.startTime && sessionForm.endTime && availableGroups.length === 0 && warningAlerts.noGroups && (
                            <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noGroups')}>
                              No groups available for the selected time slot.
                            </Alert>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Second row: Subject and Classroom */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Subject & Classroom
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <SearchableSelect
                            label="Subject *"
                            options={filteredSubjects}
                            value={sessionForm.subject}
                            onChange={(value) => handleFormChange('subject', value)}
                            getOptionLabel={(subject) => `${subject.name} (${subject.code})`}
                            searchPlaceholder="Search subjects..."
                            startIcon={sessionForm.subject ? <SubjectOutlined sx={{ color: 'primary.main', mr: 1 }} /> : null}
                          />
                          {sessionForm.groups.length > 0 && filteredSubjects.length === 0 && warningAlerts.noSubjects && (
                            <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noSubjects')}>
                              No common subjects found for the selected groups.
                            </Alert>
                          )}
                        </Box>
                        <Box>
                          {sessionForm.date && sessionForm.startTime && sessionForm.endTime && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                              <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              Only showing classrooms available at the selected time
                            </Typography>
                          )}
                          <SearchableSelect
                            label="Classroom *"
                            options={availableClassrooms.filter(classroom => {
                              // First, filter by capacity
                              const hasEnoughCapacity = getFilteredClassrooms().some(c => c._id === classroom._id);
                              if (!hasEnoughCapacity) return false;

                              // Then, filter by availability at the selected time
                              if (!sessionForm.date || !sessionForm.startTime || !sessionForm.endTime) {
                                // If date or time is not set, don't filter by availability
                                return true;
                              }

                              // Check if classroom is available at the selected time
                              return !allSessions.some(session => {
                                // Skip the current session if we're in edit mode
                                if (isEditMode && editingSession && session._id === editingSession._id) return false;

                                // Check if this session uses the current classroom and overlaps with our time slot
                                return (
                                  session.classroom._id === classroom._id &&
                                  doTimeIntervalsOverlap(
                                    sessionForm.date ? sessionForm.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                    sessionForm.startTime,
                                    sessionForm.endTime,
                                    session.date,
                                    session.startTime,
                                    session.endTime
                                  )
                                );
                              });
                            })}
                            value={sessionForm.classroom}
                            onChange={(value) => handleFormChange('classroom', value)}
                            getOptionLabel={(classroom) => {
                              // Display department, floor, and capacity
                              return `${classroom.roomNumber} (${classroom.department || 'No Dept'}, Floor: ${classroom.floor || '?'}, Capacity: ${classroom.capacity})`;
                            }}
                            searchPlaceholder="Search classrooms..."
                            startIcon={sessionForm.classroom ? <ClassOutlined sx={{ color: 'primary.main', mr: 1 }} /> : null}
                          />
                          {sessionForm.date && sessionForm.startTime && sessionForm.endTime && availableClassrooms.length === 0 && warningAlerts.noClassrooms && (
                            <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noClassrooms')}>
                              No classrooms available for the selected time slot.
                            </Alert>
                          )}
                          {sessionForm.groups.length > 0 && getFilteredClassrooms().length === 0 && warningAlerts.noClassrooms && (
                            <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noClassrooms')}>
                              No classrooms with sufficient capacity for the selected groups.
                            </Alert>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Third row: Exam Date and Time */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Exam Schedule
                        </Typography>
                        <Box sx={{ mb: 2 }}>
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
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            label="Start Time *"
                            type="time"
                            value={sessionForm.startTime}
                            onChange={(e) => {
                              const newStartTime = e.target.value;

                              // If we have a duration, recalculate the end time
                              if (sessionForm.examDuration) {
                                const [hours, minutes] = newStartTime.split(':').map(Number);
                                const startDate = new Date();
                                startDate.setHours(hours, minutes, 0);
                                const endDate = new Date(startDate.getTime() + sessionForm.examDuration * 60 * 1000);
                                const endHours = String(endDate.getHours()).padStart(2, '0');
                                const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
                                const newEndTime = `${endHours}:${endMinutes}`;

                                // Update both values at once
                                setSessionForm(prev => ({
                                  ...prev,
                                  startTime: newStartTime,
                                  endTime: newEndTime
                                }));
                              } else {
                                // Just update the start time
                                handleFormChange('startTime', newStartTime);
                              }
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                          />
                          <TextField
                            fullWidth
                            margin="normal"
                            label="Exam Duration (minutes) *"
                            type="number"
                            value={sessionForm.examDuration || ''}
                            onChange={(e) => {
                              // Calculate end time based on start time and duration
                              const duration = parseInt(e.target.value);
                              if (!isNaN(duration) && sessionForm.startTime) {
                                const [hours, minutes] = sessionForm.startTime.split(':').map(Number);
                                const startDate = new Date();
                                startDate.setHours(hours, minutes, 0);
                                const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
                                const endHours = String(endDate.getHours()).padStart(2, '0');
                                const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
                                const newEndTime = `${endHours}:${endMinutes}`;

                                // Update both values at once to ensure consistency
                                setSessionForm(prev => ({
                                  ...prev,
                                  examDuration: duration,
                                  endTime: newEndTime
                                }));
                              } else {
                                // Just update the duration if we can't calculate the end time
                                handleFormChange('examDuration', duration);
                              }
                            }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: 30, step: 15 }}
                            helperText={`End time: ${sessionForm.endTime}`}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Fourth row: Supervisors */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Supervisors & Exam Type
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <MultiSearchableSelect
                            label="Supervisors *"
                            options={availableTeachers.filter((teacher: any) => teacher.isAvailable)}
                            value={sessionForm.supervisors}
                            onChange={(value) => handleFormChange('supervisors', value)}
                            getOptionLabel={(teacher) => teacher.user?.name || 'Unknown'}
                            searchPlaceholder="Search supervisors..."

                            renderValue={(selected) =>
                              selected.map((value) => {
                                const teacher = teachers.find(t => t._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={teacher ? teacher.user?.name || 'Unknown' : value}
                                    icon={<SupervisedUserCircleOutlined />}
                                    size="small"
                                  />
                                );
                              })
                            }
                            renderOption={(teacher, checked) => (
                              <>
                                <Checkbox checked={checked} />
                                <ListItemAvatar>
                                  <Avatar>{(teacher.user?.name || 'U').charAt(0)}</Avatar>
                                </ListItemAvatar>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                  <span>{teacher.user?.name || 'Unknown'}</span>
                                  <span style={{ marginLeft: '8px', display: 'flex', gap: '8px' }}>
                                    <span style={{
                                      backgroundColor: '#e3f2fd',
                                      color: '#1976d2',
                                      borderRadius: '4px',
                                      padding: '0 4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold'
                                    }}>
                                      Selected Day: {teacher.dailySessions || 0}
                                    </span>
                                    <span style={{
                                      backgroundColor: '#e8f5e9',
                                      color: '#2e7d32',
                                      borderRadius: '4px',
                                      padding: '0 4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold'
                                    }}>
                                      Week: {teacher.weeklySessions || 0}
                                    </span>
                                  </span>
                                </div>
                              </>
                            )}
                          />
                          {sessionForm.date && sessionForm.startTime && sessionForm.endTime && (
                            <>
                              {availableTeachers.length === 0 && warningAlerts.noSupervisors && (
                                <Alert severity="warning" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noSupervisors')}>
                                  No supervisors available for the selected time slot ({sessionForm.date.toLocaleDateString()} {sessionForm.startTime}-{sessionForm.endTime}).
                                  Please select a different time or date, or check teacher availability settings.
                                </Alert>
                              )}
                              {availableTeachers.length > 0 && availableTeachers.length < 3 && warningAlerts.noSupervisors && (
                                <Alert severity="info" sx={{ mt: 1 }} onClose={() => handleCloseWarning('noSupervisors')}>
                                  Only {availableTeachers.length} supervisor{availableTeachers.length === 1 ? '' : 's'} available for this time slot.
                                </Alert>
                              )}
                            </>
                          )}

                        </Box>
                        <Box>
                          <FormControl fullWidth margin="normal">
                            <InputLabel id="exam-type-select-label">Exam Type</InputLabel>
                            <Select
                              labelId="exam-type-select-label"
                              id="exam-type-select"
                              value={
                                // In edit mode, use the original status if it's an exam type
                                isEditMode && editingSession &&
                                ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'].includes(editingSession.examType || editingSession.status)
                                  ? (editingSession.examType || editingSession.status)
                                  : ['scheduled', 'ongoing', 'completed', 'cancelled'].includes(sessionForm.status)
                                    ? 'examen_principal'
                                    : sessionForm.status
                              }
                              label="Exam Type"
                              onChange={(e) => {
                                console.log('Selected exam type:', e.target.value);
                                handleFormChange('status', e.target.value as SessionFormData['status']);
                              }}
                            >
                              <MenuItem value="devoir_surveille">Devoir surveillé</MenuItem>
                              <MenuItem value="examen_tp">Examen TP</MenuItem>
                              <MenuItem value="examen_principal">Examen principal</MenuItem>
                              <MenuItem value="examen_rattrapage">Examen rattrapage</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {isEditMode ? (
                            <Button
                              variant="outlined"
                              sx={{ mr: 2 }}
                              onClick={() => {
                                // Reset edit mode and navigate back
                                setIsEditMode(false);
                                setEditingSession(null);
                                navigate('/admin/schedule');
                              }}
                            >
                              Cancel
                            </Button>
                          ) : (
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
                                  status: 'examen_principal',
                                  examDuration: 120,
                                  sections: []
                                });
                              }}
                            >
                              Clear Form
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateSession}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                          >
                            {isEditMode ? 'Update Exam Session' : 'Create Exam Session'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error" sx={{ mt: 2 }} onClose={handleCloseError}>{error}</Alert>
                    </Grid>
                  )}
                </Grid>
              )}

              {/* Session List - Only show when not in edit mode */}
              {!isEditMode && createdSessions.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Created Sessions ({createdSessions.length})
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <List>
                      {createdSessions.map((session) => (
                        <ListItem
                          key={session.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveSession(session.id)}>
                              <ClearIcon />
                            </IconButton>
                          }
                          divider
                        >
                          <ListItemText
                            primary={session.subjectName}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(session.date).toLocaleDateString()} | {session.startTime} - {session.endTime}
                                </Typography>
                                <br />
                                Classroom: {session.classroomName} | Groups: {session.groupsNames}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitAllSessions}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                      >
                        Submit All Sessions
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Paper>
          </TabPanel>
        </Paper>
      </Box>

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
    </LocalizationProvider>
  );
};

export default SessionFormPage;
