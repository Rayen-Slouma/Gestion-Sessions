import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import {
  Box, Typography, Paper, Grid, Button,
  Alert, Snackbar, CircularProgress, Divider,
  Card, CardContent, CardHeader, List, ListItem, ListItemText,
  Tabs, Tab, FormControl, InputLabel, MenuItem, Select,
  TextField, OutlinedInput, Checkbox,
  ListItemAvatar, Avatar, InputAdornment, IconButton, Popover, ListItemButton, Chip,
  Fab
} from '@mui/material';
import {
  ClassOutlined,
  GroupOutlined,
  SubjectOutlined,
  SupervisedUserCircleOutlined,
  FolderOutlined,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import ExamScheduleCreator from '../../components/schedule/ExamScheduleCreator';
import GraphicalExamScheduleCreator from '../../components/schedule/GraphicalExamScheduleCreator';
import SessionsList from '../../components/sessions/SessionsList';

export {};

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
  status: 'devoir_surveille' | 'examen_tp' | 'examen_principal' | 'examen_rattrapage';
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
  const navigate = useNavigate();

  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [graphicalMode, setGraphicalMode] = useState(false);

  // Automatic generation state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [createdSessions, setCreatedSessions] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
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
  const [loadingResources, setLoadingResources] = useState(false);

  const [sessionForm, setSessionForm] = useState<SessionFormData>({
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

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
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
        // Process the sessions data to ensure we have proper string values
        const processedSessions = response.data.data.map((session: any) => {
          return {
            id: session._id,
            subject: session.subject?.name || 'Unknown Subject',
            date: new Date(session.date).toISOString(),
            time: `${session.startTime} - ${session.endTime}`,
            classroom: session.classroom?.roomNumber || 'No Room',
            groups: Array.isArray(session.groups)
              ? session.groups.map((g: any) => g.name || 'Unknown').join(', ')
              : 'No Groups',
            // Separate status and examType
            // If status is one of the exam types, move it to examType and set status to 'scheduled'
            status: ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'].includes(session.status)
              ? 'scheduled'
              : (session.status || 'scheduled'),
            examType: ['devoir_surveille', 'examen_tp', 'examen_principal', 'examen_rattrapage'].includes(session.status)
              ? session.status
              : (session.examType || ''),
            supervisors: Array.isArray(session.supervisors)
              ? session.supervisors.map((s: any) => s.user?.name || 'Unknown').join(', ')
              : '',
            examDuration: session.examDuration || 120,
            // Store original data for reference
            originalData: session
          };
        });

        setSessions(processedSessions);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch sessions',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error connecting to the server',
        severity: 'error'
      });
    } finally {
      setSessionsLoading(false);
    }
  }, []);

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
      console.log('Teachers data:', teachersData);

      // Fetch sections for the section dropdown
      const sectionsRes = await axios.get(`${API_URL}/api/sections`, { headers });
      const sectionsData = sectionsRes.data.data;

      console.log('Fetched data:', {
        subjects: subjectsData,
        classrooms: classroomsData,
        groups: groupsData,
        teachers: teachersData,
        sections: sectionsData
      });

      setSubjects(subjectsData);
      setClassrooms(classroomsData);
      setGroups(groupsData);
      setTeachers(teachersData);
      setSections(sectionsData);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.message || 'Failed to load resources for session creation');
    }
    setLoadingResources(false);
  }, []);

  // Fetch sessions when component mounts
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch resources for manual session creation
  useEffect(() => {
    if (tabValue === 1) {
      fetchResources();
    }
  }, [tabValue, fetchResources]);

  // Function to delete a session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Send delete request to the server
      const response = await axios.delete(`${API_URL}/api/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Check if there are affected supervisors that need to be refreshed
        if (response.data.affectedSupervisors && response.data.affectedSupervisors.length > 0) {
          console.log('Supervisors affected by deletion:', response.data.affectedSupervisors);
        }

        // Remove the deleted session from the state
        setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));

        // Show success message
        setSnackbar({
          open: true,
          message: 'Session deleted successfully',
          severity: 'success'
        });

        // Refresh sessions list
        fetchSessions();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to delete session',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error deleting session:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting session',
        severity: 'error'
      });
    }
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

      setSnackbar({
        open: true,
        message: 'Exam schedule successfully generated!',
        severity: 'success'
      });
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
  const handleCreateSession = () => {
    // Validate form
    if (!sessionForm.subject || !sessionForm.date || !sessionForm.classroom ||
        sessionForm.groups.length === 0 || sessionForm.sections.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);

    // Format date for API
    const formattedDate = format(sessionForm.date, 'yyyy-MM-dd');

    // Find the selected subject, classroom, and groups to display in the list
    const selectedSubjectObj = subjects.find(s => s._id === sessionForm.subject);
    const selectedClassroomObj = classrooms.find(c => c._id === sessionForm.classroom);
    const selectedGroupsObj = sessionForm.groups.map(groupId =>
      groups.find(g => g._id === groupId)
    ).filter(Boolean);

    // Prepare the session data for the list
    const sessionPreview = {
      id: Date.now().toString(), // Temporary ID for the list
      subject: sessionForm.subject,
      subjectName: selectedSubjectObj ? `${selectedSubjectObj.name} (${selectedSubjectObj.code})` : '',
      date: formattedDate,
      startTime: sessionForm.startTime,
      endTime: sessionForm.endTime,
      examDuration: sessionForm.examDuration,
      classroom: sessionForm.classroom,
      classroomName: selectedClassroomObj ? selectedClassroomObj.roomNumber : '',
      groups: sessionForm.groups,
      groupsNames: selectedGroupsObj.map(g => g?.name || '').join(', '),
      supervisors: sessionForm.supervisors,
      status: sessionForm.status,
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

    // Add to the list of created sessions
    setCreatedSessions([...createdSessions, sessionPreview]);

    // Reset form after adding to list
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

    setSnackbar({
      open: true,
      message: 'Session added to the list',
      severity: 'success'
    });
  };

  // Function to submit all created sessions to the server
  const handleSubmitAllSessions = async () => {
    if (createdSessions.length === 0) {
      setError('No sessions to submit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Extract the full data for API submission
      const sessionsToSubmit = createdSessions.map(session => session.fullData);

      console.log('Submitting sessions:', sessionsToSubmit);

      // Send the data to the server
      const response = await axios.post(`${API_URL}/api/sessions/bulk`, sessionsToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Sessions created successfully:', response.data);

      // Clear the list after successful submission
      setCreatedSessions([]);

      setSnackbar({
        open: true,
        message: `Successfully created ${sessionsToSubmit.length} exam sessions!`,
        severity: 'success'
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating sessions:', err);
      setError(err.response?.data?.message || 'Failed to create sessions');
      setLoading(false);
    }
  };

  // Remove a session from the list
  const handleRemoveSession = (id: string) => {
    setCreatedSessions(createdSessions.filter(session => session.id !== id));
  };

  // Filter groups based on selected sections and common subjects
  const filteredGroups = sessionForm.sections.length > 0
    ? groups.filter(group => {
        // Check if the group's section is in the selected sections
        const sectionMatch = sessionForm.sections.includes(group.section._id);

        // If a subject is selected, check if the group studies this subject
        if (sessionForm.subject && sectionMatch) {
          if (!group.subjects || group.subjects.length === 0) {
            return false;
          }

          // Check if the group has the selected subject
          return group.subjects.some(subject => {
            if (typeof subject === 'string') {
              return subject === sessionForm.subject;
            } else if (subject && typeof subject === 'object' && '_id' in subject) {
              return subject._id === sessionForm.subject;
            }
            return false;
          });
        }

        return sectionMatch;
      })
    : groups;

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

    console.log('Selected groups:', selectedGroups);

    if (selectedGroups.length === 0) {
      return subjects;
    }

    // Extract subject IDs from each group
    const groupSubjectIds = selectedGroups.map(group => {
      if (!group) return [];

      console.log('Processing group:', group.name, 'with subjects:', group.subjects);

      if (!group.subjects || group.subjects.length === 0) {
        console.log('No subjects found for group:', group.name);
        return [];
      }

      // Convert subjects to IDs if they are objects
      const subjectIds = group.subjects.map(subject => {
        if (typeof subject === 'string') {
          console.log('Subject is a string ID:', subject);
          return subject;
        } else if (subject && typeof subject === 'object' && '_id' in subject) {
          console.log('Subject is an object:', subject);
          return subject._id;
        }
        console.log('Invalid subject format:', subject);
        return null;
      }).filter(Boolean) as string[];

      console.log('Extracted subject IDs for group', group.name, ':', subjectIds);
      return subjectIds;
    });

    console.log('Group subject IDs:', groupSubjectIds);

    if (groupSubjectIds.length === 0 || groupSubjectIds.some(ids => ids.length === 0)) {
      console.log('No valid subject IDs found');
      return [];
    }

    // If only one group is selected, return all its subjects
    if (groupSubjectIds.length === 1) {
      console.log('Only one group selected, returning all its subjects');
      const result = subjects.filter(subject => groupSubjectIds[0].includes(subject._id));
      console.log('Filtered subjects for single group:', result);
      return result;
    }

    // Find common subject IDs across all groups
    const commonSubjectIds = groupSubjectIds.reduce((common, current) => {
      const filtered = common.filter(id => current.includes(id));
      console.log('Common IDs after filtering:', filtered);
      return filtered;
    }, groupSubjectIds[0]);

    console.log('Final common subject IDs:', commonSubjectIds);

    // Return the full subject objects for the common IDs
    const result = subjects.filter(subject => commonSubjectIds.includes(subject._id));
    console.log('Final filtered subjects:', result);
    return result;
  };

  // Filter subjects based on common subjects between selected groups
  const filteredSubjects = getCommonSubjects();

  // Get classrooms filtered by capacity
  const getFilteredClassrooms = () => {
    if (sessionForm.groups.length === 0) {
      return classrooms;
    }

    // Calculate total number of students in selected groups
    const totalStudents = sessionForm.groups.reduce((total, groupId) => {
      const group = groups.find(g => g._id === groupId);
      return total + (group?.size || 0);
    }, 0);

    // Filter classrooms with sufficient capacity
    return classrooms.filter(classroom => classroom.capacity >= totalStudents);
  };

  // Calculate recommended end time based on subject duration
  useEffect(() => {
    if (sessionForm.subject && selectedSubject) {
      // Only update if the user hasn't manually set a duration
      if (!sessionForm.examDuration) {
        // Parse start time
        const [hours, minutes] = sessionForm.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);

        // Add exam duration from the subject
        const endDate = new Date(startDate.getTime() + selectedSubject.examDuration * 60 * 1000);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

        // Update end time and set the exam duration from the subject
        setSessionForm(prevForm => ({
          ...prevForm,
          endTime: `${endHours}:${endMinutes}`,
          examDuration: selectedSubject.examDuration
        }));
      } else if (sessionForm.startTime) {
        // If user has set a duration but changed the start time, recalculate end time
        const [hours, minutes] = sessionForm.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);

        // Use the user's manually set duration
        const endDate = new Date(startDate.getTime() + sessionForm.examDuration * 60 * 1000);
        const endHours = String(endDate.getHours()).padStart(2, '0');
        const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

        // Update only the end time, preserving the user's duration
        setSessionForm(prevForm => ({
          ...prevForm,
          endTime: `${endHours}:${endMinutes}`
        }));
      }
    }
  }, [sessionForm.subject, sessionForm.startTime, selectedSubject, sessionForm.examDuration]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Exam Schedule Management
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Upcoming Exam Sessions</Typography>
              <Fab
                color="primary"
                size="small"
                onClick={() => navigate('/admin/session-form')}
                aria-label="add session"
              >
                <AddIcon />
              </Fab>
            </Box>
            {sessionsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <SessionsList
                sessions={sessions || []}
                loading={sessionsLoading}
                onRefresh={fetchSessions}
                onEdit={(session: any) => {
                  // Navigate to the edit form with the session ID
                  navigate(`/admin/session-form?edit=${session.id}`);
                }}
                onDelete={(sessionId: string) => {
                  // Handle delete functionality
                  console.log('Delete session:', sessionId);
                  // Implement delete functionality
                  handleDeleteSession(sessionId);
                }}
              />
            )}
          </Paper>
        </Box>
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

export default ScheduleGeneration;
