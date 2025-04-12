import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { API_URL } from '../../config';
import { format, parseISO, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Styled components for the Material UI version
const TableContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    '& td, & th': {
      border: '1px solid rgba(224, 224, 224, 1)',
      padding: theme.spacing(1),
    }
  }
}));

const HeaderCell = styled('th')(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const InputField = styled('input')(({ theme }) => ({
  width: '100%',
  background: 'transparent',
  border: 'none',
  padding: theme.spacing(0.5),
  '&:focus': {
    outline: 'none',
    backgroundColor: theme.palette.action.hover,
  },
  overflow: 'visible',
  textOverflow: 'clip',
  whiteSpace: 'normal',
  lineHeight: '1.2'
}));

// Interfaces
interface ExamSession {
  id: string;
  code: string;
  subject: string;
  instructor: string;
  room: string;
  capacity: string;
  location: string;
  examDuration?: number;
  startTime?: string;
}

interface ExamDay {
  id: string;
  date: string;
  dayName: string;
  morningExam: ExamSession | null;
  afternoonExam: ExamSession | null;
}

interface HeaderInfo {
  faculty: string;
  department: string;
  semester: string;
  sessionType: string;
  coordinator: string;
  section: string;
  groups: string[];
  programCode: string;
}

// Types for API data
interface ApiSession {
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
    building?: string;
    capacity: number;
  };
  groups: Array<{
    _id: string;
    name: string;
  }>;
  supervisors: Array<{
    _id: string;
    user: {
      name: string;
    };
  }>;
  status: string;
}

interface ApiSubject {
  _id: string;
  name: string;
  code: string;
}

interface ApiClassroom {
  _id: string;
  roomNumber: string;
  building: string;
  capacity: number;
}

interface ApiGroup {
  _id: string;
  name: string;
  size: number;
  section: {
    _id: string;
    name: string;
  };
}

interface ApiTeacher {
  _id: string;
  user: {
    name: string;
  };
}

// Interface for drag-and-drop operation result
interface DragResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

// Color definitions matching the provided image - updated
const COLORS = {
  // Header colors
  headerBackground: '#FFFFFF',
  headerSecondary: '#F5F5F5',
  sessionBlue: '#0047AB',
  tableHeaderBlue: '#E6F0F8',

  // Day header colors
  dayHeaderBlue: '#E6F0F8',

  // Room code colors
  roomCodeGreen: '#53',
  roomCodeBlue: '#S11',
  roomCodeRed: '#S61',
  roomCodePurple: '#S41',

  // Exam rows colors
  courseCodeGreen: '#53',
  subjectGreen: '#E6F7E6',
  timeSlotGray: '#F0F0F0',
  durationGray: '#F0F0F0',

  // Footer colors
  programYellow: '#FFEFB8',
  noticeYellow: '#FFF9E6',
  coordinatorYellow: '#FFEFB8',
  instructorYellow: '#FFEFB8',

  // Borders
  borderGray: '#D3D3D3',

  // Special colors from image
  headerBlue: '#4472C4',
  lightBlue: '#E6F0F8',
  lightGreen: '#E6F7E6',
  mediumGreen: '#53',
  lightYellow: '#FFEFB8'
};

const GraphicalExamScheduleCreator: React.FC = () => {
  // State for API data
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for header info
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    faculty: 'كلية العلوم بتونس\nFaculté des Sciences de Tunis',
    department: '',
    semester: 'Premier semestre',
    sessionType: 'Session principale',
    coordinator: '',
    section: '',
    groups: [],
    programCode: ''
  });

  // State for dropdown options
  const [departments, setDepartments] = useState<{_id: string, name: string}[]>([]);
  const [sections, setSections] = useState<{_id: string, name: string}[]>([]);
  const [allGroups, setAllGroups] = useState<ApiGroup[]>([]);
  const [availableGroups, setAvailableGroups] = useState<ApiGroup[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<ApiSubject[]>([]);

  // Session type options
  const sessionTypes = [
    'Session principale',
    'Session rattrapage',
    'Devoir surveillé',
    'Examen TP'
  ];

  // Semester options
  const semesterOptions = [
    'Premier semestre',
    'Deuxième semestre'
  ];

  // Function to create an empty day
  const createEmptyDay = () => {
    // Get the current date
    const today = new Date();
    const formattedDate = format(today, 'dd/MM/yyyy');
    const dayName = format(today, 'EEEE', { locale: fr });
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    return {
      id: 'day-1',
      date: formattedDate,
      dayName: capitalizedDayName,
      morningExam: {
        id: 'exam-1',
        code: '',
        subject: '',
        instructor: '',
        room: '',
        capacity: '',
        location: ''
      },
      afternoonExam: {
        id: 'exam-2',
        code: '',
        subject: '',
        instructor: '',
        room: '',
        capacity: '',
        location: ''
      }
    };
  };

  // Function to format section and groups
  const formatSectionAndGroups = useCallback(() => {
    if (!headerInfo.section || headerInfo.groups.length === 0) {
      return '';
    }
    // Find the section name from the section ID
    const sectionObj = sections.find(s => s._id === headerInfo.section);
    const sectionName = sectionObj ? sectionObj.name : headerInfo.section;
    return `${sectionName}: ${headerInfo.groups.join(', ')}`;
  }, [headerInfo.section, headerInfo.groups, sections]);

  // State for exam days - start with a single empty day
  const [examDays, setExamDays] = useState<ExamDay[]>([createEmptyDay()]);

  // Reset to a single empty day when the component is mounted
  useEffect(() => {
    // Reset to a single empty day
    setExamDays([createEmptyDay()]);
    // Reset section info
    setSectionInfo('');
  }, []);

  const [sectionInfo, setSectionInfo] = useState('');

  // Function to fetch data from the API
  const fetchData = useCallback(async () => {
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

      // Fetch sessions
      const sessionsRes = await axios.get(`${API_URL}/api/sessions`, { headers });
      const sessionsData = sessionsRes.data.data;

      // Fetch subjects
      const subjectsRes = await axios.get(`${API_URL}/api/subjects`, { headers });
      const subjectsData = subjectsRes.data.data;

      // Fetch classrooms
      const classroomsRes = await axios.get(`${API_URL}/api/classrooms`, { headers });
      const classroomsData = classroomsRes.data.data;

      // Fetch groups
      const groupsRes = await axios.get(`${API_URL}/api/groups`, { headers });
      const groupsData = groupsRes.data.data;

      // Fetch teachers
      const teachersRes = await axios.get(`${API_URL}/api/teachers`, { headers });
      const teachersData = teachersRes.data.data;

      // Fetch departments
      const departmentsRes = await axios.get(`${API_URL}/api/departments`, { headers });
      const departmentsData = departmentsRes.data.data;

      // Fetch sections
      const sectionsRes = await axios.get(`${API_URL}/api/sections`, { headers });
      const sectionsData = sectionsRes.data.data;

      console.log('Fetched data:', {
        sessions: sessionsData,
        subjects: subjectsData,
        classrooms: classroomsData,
        groups: groupsData,
        teachers: teachersData,
        departments: departmentsData,
        sections: sectionsData
      });

      setSessions(sessionsData);
      setSubjects(subjectsData);
      setClassrooms(classroomsData);
      setGroups(groupsData);
      setTeachers(teachersData);
      setDepartments(departmentsData);
      setSections(sectionsData);
      setAllGroups(groupsData);
      setAvailableGroups(groupsData);

      // We no longer transform sessions into exam days automatically
      // This ensures we start with a single empty day
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to transform sessions into exam days
  const transformSessionsToExamDays = (sessionsData: ApiSession[]) => {
    if (!sessionsData || sessionsData.length === 0) {
      return;
    }

    // Group sessions by date
    const sessionsByDate = sessionsData.reduce((acc, session) => {
      const dateStr = format(new Date(session.date), 'dd/MM/yyyy');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(session);
      return acc;
    }, {} as Record<string, ApiSession[]>);

    // Create exam days from grouped sessions
    const newExamDays: ExamDay[] = Object.entries(sessionsByDate).map(([dateStr, dateSessions], index) => {
      // Sort sessions by start time
      dateSessions.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });

      // Get morning and afternoon sessions
      const morningSession = dateSessions.find(s => {
        const hour = parseInt(s.startTime.split(':')[0]);
        return hour < 12;
      });

      const afternoonSession = dateSessions.find(s => {
        const hour = parseInt(s.startTime.split(':')[0]);
        return hour >= 12;
      });

      // Create exam day
      const dayDate = new Date(dateSessions[0].date);
      const dayName = format(dayDate, 'EEEE', { locale: fr });

      return {
        id: `day-${index + 1}`,
        date: dateStr,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        morningExam: morningSession ? {
          id: morningSession._id,
          code: morningSession.subject.code,
          subject: morningSession.subject.name,
          instructor: morningSession.supervisors.length > 0 ? morningSession.supervisors[0].user.name : '',
          room: morningSession.classroom.roomNumber,
          capacity: morningSession.classroom.capacity.toString(),
          location: morningSession.classroom.building || '',
          examDuration: morningSession.examDuration,
          startTime: morningSession.startTime
        } : null,
        afternoonExam: afternoonSession ? {
          id: afternoonSession._id,
          code: afternoonSession.subject.code,
          subject: afternoonSession.subject.name,
          instructor: afternoonSession.supervisors.length > 0 ? afternoonSession.supervisors[0].user.name : '',
          room: afternoonSession.classroom.roomNumber,
          capacity: afternoonSession.classroom.capacity.toString(),
          location: afternoonSession.classroom.building || '',
          examDuration: afternoonSession.examDuration,
          startTime: afternoonSession.startTime
        } : null
      };
    });

    // Update exam days state
    if (newExamDays.length > 0) {
      setExamDays(newExamDays);

      // Update section info based on groups in sessions
      const allGroups = sessionsData.flatMap(s => s.groups.map(g => g.name));
      // Get unique groups without using Set spread operator (for TypeScript compatibility)
      const uniqueGroups: string[] = [];
      allGroups.forEach(group => {
        if (!uniqueGroups.includes(group)) {
          uniqueGroups.push(group);
        }
      });
      // Get sections from the groups
      const groupsBySection: Record<string, string[]> = {};
      sessionsData.forEach(s => {
        s.groups.forEach(g => {
          const sectionName = groups.find(grp => grp._id === g._id)?.section?.name || '';
          if (!groupsBySection[sectionName]) {
            groupsBySection[sectionName] = [];
          }
          if (!groupsBySection[sectionName].includes(g.name)) {
            groupsBySection[sectionName].push(g.name);
          }
        });
      });

      // Format as "Section1: Group1, Group2 / Section2: Group3, Group4"
      const formattedSections = Object.entries(groupsBySection)
        .map(([section, groups]) => `${section}: ${groups.join(', ')}`)
        .join(' / ');

      setSectionInfo(formattedSections);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter groups by selected section
  useEffect(() => {
    if (headerInfo.section) {
      // Filter groups that belong to the selected section
      const filteredGroups = allGroups.filter(group =>
        group.section && group.section._id === headerInfo.section
      );
      setAvailableGroups(filteredGroups);
    } else {
      // If no section is selected, show all groups
      setAvailableGroups(allGroups);
    }
  }, [headerInfo.section, allGroups]);

  // Filter subjects based on selected groups
  useEffect(() => {
    const fetchSubjectsForGroups = async () => {
      if (headerInfo.groups.length > 0) {
        try {
          // In a real implementation, you would fetch subjects for the selected groups from the API
          // For now, we'll just filter the subjects we already have
          // This is a placeholder - in a real app, you'd make an API call to get subjects for these groups
          const filteredSubjects = subjects.filter(subject =>
            // In a real app, you'd have a way to know which subjects are studied by which groups
            // For now, we'll just show all subjects
            true
          );
          setAvailableSubjects(filteredSubjects);
        } catch (error) {
          console.error('Error fetching subjects for groups:', error);
        }
      } else {
        // If no groups are selected, show all subjects
        setAvailableSubjects(subjects);
      }
    };

    fetchSubjectsForGroups();
  }, [headerInfo.groups, subjects]);

  // Update section info when section or groups change
  useEffect(() => {
    setSectionInfo(formatSectionAndGroups());
  }, [formatSectionAndGroups]);

  // Handler for header info changes
  const handleHeaderChange = (field: keyof HeaderInfo, value: string | string[]) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handler for exam details changes
  const handleExamChange = (dayId: string, timeSlot: 'morningExam' | 'afternoonExam', field: keyof ExamSession, value: string) => {
    const updatedDays = examDays.map(day => {
      if (day.id === dayId && day[timeSlot]) {
        return {
          ...day,
          [timeSlot]: {
            ...day[timeSlot],
            [field]: value
          }
        };
      }
      return day;
    });

    setExamDays(updatedDays);
  };

  // Function to sort days chronologically
  const sortDaysByDate = (days: ExamDay[]): ExamDay[] => {
    return [...days].sort((a, b) => {
      if (!a.date || !b.date) return 0;

      // Parse dates in format dd/MM/yyyy
      const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
      const [bDay, bMonth, bYear] = b.date.split('/').map(Number);

      // Compare years first
      if (aYear !== bYear) return aYear - bYear;
      // Then months
      if (aMonth !== bMonth) return aMonth - bMonth;
      // Then days
      return aDay - bDay;
    });
  };

  // Function to add a new day to the schedule
  const addNewDay = () => {
    const newDayId = `day-${examDays.length + 1}`;

    // Get the current date
    const today = new Date();
    const formattedDate = format(today, 'dd/MM/yyyy');
    const dayName = format(today, 'EEEE', { locale: fr });
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    const newDay: ExamDay = {
      id: newDayId,
      date: formattedDate,
      dayName: capitalizedDayName,
      morningExam: {
        id: `exam-${examDays.length * 2 + 1}`,
        code: '',
        subject: '',
        instructor: '',
        room: '',
        capacity: '',
        location: ''
      },
      afternoonExam: {
        id: `exam-${examDays.length * 2 + 2}`,
        code: '',
        subject: '',
        instructor: '',
        room: '',
        capacity: '',
        location: ''
      }
    };

    // Add the new day and sort chronologically
    const updatedDays = sortDaysByDate([...examDays, newDay]);
    setExamDays(updatedDays);
  };

  // Function to delete a day from the schedule
  const deleteDay = (dayId: string) => {
    // Filter out the day with the given ID
    const updatedDays = examDays.filter(day => day.id !== dayId);

    // Update the examDays array
    setExamDays(updatedDays);
  };

  // Export schedule function
  const exportSchedule = () => {
    const dataStr = JSON.stringify({ headerInfo, examDays }, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = 'exam-schedule.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Print schedule function
  const printSchedule = () => {
    window.print();
  };

  // Export as image (this would typically use html-to-image or a similar library)
  const exportAsImage = () => {
    alert('Export as image functionality would be implemented with html-to-image or similar library');
  };

  // Show loading state or error message
  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Box sx={{ ml: 2 }}>Chargement des données...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
          <Button sx={{ ml: 2 }} variant="outlined" size="small" onClick={fetchData}>
            Réessayer
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Information Section */}
      <TableContainer elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ p: 2, mb: 3, border: '1px solid rgba(224, 224, 224, 0.7)', borderRadius: 1 }}>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>Information d'en-tête</h2>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Faculté"
                value={headerInfo.faculty}
                onChange={(e) => handleHeaderChange('faculty', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Département</InputLabel>
                <Select
                  value={headerInfo.department}
                  onChange={(e) => handleHeaderChange('department', e.target.value)}
                  label="Département"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept.name}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Semestre</InputLabel>
                <Select
                  value={headerInfo.semester}
                  onChange={(e) => handleHeaderChange('semester', e.target.value)}
                  label="Semestre"
                >
                  {semesterOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Type de session</InputLabel>
                <Select
                  value={headerInfo.sessionType}
                  onChange={(e) => handleHeaderChange('sessionType', e.target.value)}
                  label="Type de session"
                >
                  {sessionTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Coordinateur</InputLabel>
                <Select
                  value={headerInfo.coordinator}
                  onChange={(e) => handleHeaderChange('coordinator', e.target.value)}
                  label="Coordinateur"
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher.user.name}>{teacher.user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select
                  value={headerInfo.section}
                  onChange={(e) => handleHeaderChange('section', e.target.value)}
                  label="Section"
                >
                  {sections.map((section) => (
                    <MenuItem key={section._id} value={section._id}>{section.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Groupes</InputLabel>
                <Select
                  multiple
                  value={headerInfo.groups}
                  onChange={(e: SelectChangeEvent<string[]>) => {
                    const value = e.target.value;
                    const selectedGroups = typeof value === 'string' ? [value] : value;
                    handleHeaderChange('groups', selectedGroups);

                    // If groups are selected but no section is selected, automatically select the section
                    if (selectedGroups.length > 0 && !headerInfo.section) {
                      // Find the section of the first selected group
                      const selectedGroup = allGroups.find(g => g.name === selectedGroups[0]);
                      if (selectedGroup && selectedGroup.section) {
                        handleHeaderChange('section', selectedGroup.section._id);
                      }
                    }
                  }}
                  input={<OutlinedInput label="Groupes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Box key={value} sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                          {value}
                        </Box>
                      ))}
                    </Box>
                  )}
                >
                  {availableGroups.map((group) => (
                    <MenuItem key={group._id} value={group.name}>
                      <Checkbox checked={headerInfo.groups.indexOf(group.name) > -1} />
                      <ListItemText primary={group.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Code du programme"
                value={headerInfo.programCode}
                onChange={(e) => handleHeaderChange('programCode', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </TableContainer>

      {/* Main Schedule Table - Fix color application */}
      <TableContainer elevation={3}>
        {/* Apply inline style to the container to ensure it respects the styling */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '4px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{
            tableLayout: 'fixed',
            width: '100%',
            borderCollapse: 'collapse',
            border: `1px solid ${COLORS.borderGray}`
          }}>
            <thead>
              {/* Header Row 1 */}
              <tr style={{ backgroundColor: COLORS.headerBackground }}>
                <th style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  width: '180px',
                  backgroundColor: COLORS.headerBackground
                }}>
                  <input
                    type="text"
                    value={headerInfo.faculty}
                    onChange={(e) => handleHeaderChange('faculty', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', fontWeight: 'bold', textAlign: 'center' }}
                  />
                </th>
                <th colSpan={examDays.length} style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: COLORS.headerBackground
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: '64px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: COLORS.tableHeaderBlue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${COLORS.tableHeaderBlue}`
                      }}>
                        Logo
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <input
                          type="text"
                          value={headerInfo.department}
                          onChange={(e) => handleHeaderChange('department', e.target.value)}
                          style={{ width: '100%', background: 'transparent', border: 'none', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={headerInfo.sessionType}
                          onChange={(e) => handleHeaderChange('sessionType', e.target.value)}
                          style={{ width: '100%', background: 'transparent', border: 'none', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}
                        />
                      </div>
                    </div>
                    <div style={{ width: '64px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: COLORS.tableHeaderBlue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${COLORS.tableHeaderBlue}`
                      }}>
                        Logo
                      </div>
                    </div>
                  </div>
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr style={{ backgroundColor: COLORS.headerSecondary }}>
                <th style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  backgroundColor: COLORS.headerSecondary
                }}>
                  <input
                    type="text"
                    value={headerInfo.semester}
                    onChange={(e) => handleHeaderChange('semester', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center' }}
                  />
                </th>
                <th colSpan={examDays.length} style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: COLORS.sessionBlue,
                  color: 'white'
                }}>
                  <input
                    type="text"
                    value={headerInfo.sessionType}
                    onChange={(e) => handleHeaderChange('sessionType', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center', color: 'white' }}
                  />
                </th>
              </tr>

              {/* Day Names Row */}
              <tr style={{ backgroundColor: COLORS.tableHeaderBlue }}>
                <th style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  width: '180px',
                  backgroundColor: COLORS.tableHeaderBlue
                }}>
                  Journée
                </th>
                {examDays.map(day => (
                  <th key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: COLORS.tableHeaderBlue,
                    width: `${100 / examDays.length}%`,
                    position: 'relative'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%', textAlign: 'center', fontWeight: 'bold' }}>
                        {day.dayName}
                      </div>
                      {examDays.length > 1 && (
                        <Button
                          size="small"
                          color="error"
                          sx={{
                            minWidth: '24px',
                            width: '24px',
                            height: '24px',
                            p: 0,
                            position: 'absolute',
                            top: '2px',
                            right: '2px'
                          }}
                          onClick={() => deleteDay(day.id)}
                        >
                          ×
                        </Button>
                      )}
                    </Box>
                  </th>
                ))}
              </tr>

              {/* Dates Row */}
              <tr style={{ backgroundColor: COLORS.tableHeaderBlue }}>
                <th style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: COLORS.tableHeaderBlue,
                  fontWeight: 'bold'
                }}>
                  Date
                </th>
                {examDays.map(day => (
                  <th key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    textAlign: 'center',
                    backgroundColor: COLORS.tableHeaderBlue
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                        <DatePicker
                          value={day.date ? parse(day.date, 'dd/MM/yyyy', new Date()) : null}
                          onChange={(newDate) => {
                            if (newDate) {
                              // Format date as dd/MM/yyyy
                              const formattedDate = format(newDate, 'dd/MM/yyyy');

                              // Set day name automatically based on the date
                              const dayName = format(newDate, 'EEEE', { locale: fr });
                              const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

                              // Update the current day with new date and day name
                              const updatedDaysWithNewDate = examDays.map(d =>
                                d.id === day.id ? { ...d, date: formattedDate, dayName: capitalizedDayName } : d
                              );

                              // Sort days chronologically
                              const sortedDays = sortDaysByDate(updatedDaysWithNewDate);
                              setExamDays(sortedDays);
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: "standard",
                              sx: {
                                '& input': { textAlign: 'center' },
                                '& .MuiInputBase-root': { display: 'flex', justifyContent: 'center' }
                              },
                              InputProps: {
                                disableUnderline: true,
                                style: { textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold' }
                              }
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Morning Exam Subject with Time */}
              <tr>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.timeSlotGray,
                  fontWeight: 'bold',
                  width: '180px'
                }}>
                  Début des épreuves
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    backgroundColor: day.morningExam ? COLORS.subjectGreen : '#ffffff',
                    height: '60px',
                    verticalAlign: 'top'
                  }}>
                    {day.morningExam && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: '4px',
                          color: '#1976d2',
                          backgroundColor: COLORS.courseCodeGreen,
                          padding: '2px',
                          borderRadius: '4px'
                        }}>
                          {day.morningExam.code}
                        </div>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={day.morningExam.subject || ''}
                            onChange={(e) => {
                              // Find the selected subject to get its code
                              const selectedSubject = availableSubjects.find(s => s.name === e.target.value);
                              if (selectedSubject) {
                                // Update both subject name and code
                                handleExamChange(day.id, 'morningExam', 'subject', selectedSubject.name);
                                handleExamChange(day.id, 'morningExam', 'code', selectedSubject.code);
                              }
                            }}
                            displayEmpty
                            sx={{
                              fontSize: '0.9rem',
                              height: '32px',
                              '.MuiSelect-select': { padding: '4px 8px' }
                            }}
                          >
                            <MenuItem value="" disabled>Sélectionner une matière</MenuItem>
                            {availableSubjects.map((subject) => (
                              <MenuItem key={subject._id} value={subject.name}>
                                {subject.name} ({subject.code})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <input
                          type="text"
                          value="08H30"
                          onChange={(e) => {/* Handle time change */}}
                          style={{
                            width: '70px',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            margin: '4px auto 0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '2px',
                            backgroundColor: COLORS.timeSlotGray
                          }}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Morning Duration */}
              <tr style={{ backgroundColor: COLORS.durationGray }}>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '4px',
                  backgroundColor: COLORS.durationGray,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  height: '30px'
                }}>
                  Durée
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '4px',
                    textAlign: 'center',
                    backgroundColor: COLORS.durationGray
                  }}>
                    {day.morningExam && (
                      <input
                        type="text"
                        defaultValue="1h30"
                        style={{
                          width: '60px',
                          padding: '2px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          color: '#616161',
                          backgroundColor: 'white'
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>

              {/* Afternoon Exam Subject with Time */}
              <tr>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.timeSlotGray,
                  fontWeight: 'bold'
                }}>
                  Début des épreuves
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    backgroundColor: day.afternoonExam ? COLORS.subjectGreen : '#ffffff',
                    height: '60px',
                    verticalAlign: 'top'
                  }}>
                    {day.afternoonExam && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: '4px',
                          color: '#1976d2',
                          backgroundColor: COLORS.courseCodeGreen,
                          padding: '2px',
                          borderRadius: '4px'
                        }}>
                          {day.afternoonExam.code}
                        </div>
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={day.afternoonExam.subject || ''}
                            onChange={(e) => {
                              // Find the selected subject to get its code
                              const selectedSubject = availableSubjects.find(s => s.name === e.target.value);
                              if (selectedSubject) {
                                // Update both subject name and code
                                handleExamChange(day.id, 'afternoonExam', 'subject', selectedSubject.name);
                                handleExamChange(day.id, 'afternoonExam', 'code', selectedSubject.code);
                              }
                            }}
                            displayEmpty
                            sx={{
                              fontSize: '0.9rem',
                              height: '32px',
                              '.MuiSelect-select': { padding: '4px 8px' }
                            }}
                          >
                            <MenuItem value="" disabled>Sélectionner une matière</MenuItem>
                            {availableSubjects.map((subject) => (
                              <MenuItem key={subject._id} value={subject.name}>
                                {subject.name} ({subject.code})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <input
                          type="text"
                          value="11H00"
                          onChange={(e) => {/* Handle time change */}}
                          style={{
                            width: '70px',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            margin: '4px auto 0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '2px',
                            backgroundColor: COLORS.timeSlotGray
                          }}
                        />
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Afternoon Duration */}
              <tr style={{ backgroundColor: COLORS.durationGray }}>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '4px',
                  backgroundColor: COLORS.durationGray,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  height: '30px'
                }}>
                  Durée
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '4px',
                    textAlign: 'center',
                    backgroundColor: COLORS.durationGray
                  }}>
                    {day.afternoonExam && (
                      <input
                        type="text"
                        defaultValue="1h30"
                        style={{
                          width: '60px',
                          padding: '2px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          textAlign: 'center',
                          color: '#616161',
                          backgroundColor: 'white'
                        }}
                      />
                    )}
                  </td>
                ))}
              </tr>

              {/* Group */}
              <tr>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.timeSlotGray,
                  fontWeight: 'bold'
                }}>
                  Groupe
                </td>
                <td colSpan={examDays.length} style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: COLORS.programYellow
                }}>
                  <input
                    type="text"
                    value={formatSectionAndGroups()}
                    onChange={(e) => setSectionInfo(e.target.value)}
                    style={{
                      width: '60%',
                      padding: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'center',
                      backgroundColor: 'white'
                    }}
                  />
                </td>
              </tr>

              {/* Room Information */}
              <tr>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.timeSlotGray,
                  fontWeight: 'bold'
                }}>
                  Salle
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    backgroundColor: 'white',
                    textAlign: 'center',
                    height: '40px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        value={day.morningExam?.room || ''}
                        onChange={(e) => handleExamChange(day.id, 'morningExam', 'room', e.target.value)}
                        placeholder="Salle matin"
                        style={{
                          width: '100%',
                          resize: 'none',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: COLORS.tableHeaderBlue,
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          padding: '2px',
                          minHeight: '28px'
                        }}
                      />
                      <textarea
                        value={day.afternoonExam?.room || ''}
                        onChange={(e) => day.afternoonExam && handleExamChange(day.id, 'afternoonExam', 'room', e.target.value)}
                        placeholder="Salle après-midi"
                        style={{
                          width: '100%',
                          resize: 'none',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: COLORS.tableHeaderBlue,
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          padding: '2px',
                          minHeight: '28px'
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Coordinator */}
              <tr style={{ backgroundColor: COLORS.coordinatorYellow }}>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  fontWeight: 'bold',
                  backgroundColor: COLORS.coordinatorYellow,
                  textAlign: 'center'
                }}>
                  Coordinateur
                </td>
                <td colSpan={examDays.length} style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  textAlign: 'center',
                  backgroundColor: COLORS.coordinatorYellow
                }}>
                  <input
                    type="text"
                    value={headerInfo.coordinator}
                    style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px',
                      width: '60%',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}
                    onChange={(e) => handleHeaderChange('coordinator', e.target.value)}
                  />
                </td>
              </tr>

              {/* Teachers */}
              <tr style={{ backgroundColor: COLORS.instructorYellow }}>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.instructorYellow,
                  fontWeight: 'bold'
                }}>
                  Nom & prénom de l'enseignant de la matière
                </td>
                {examDays.map(day => (
                  <td key={day.id} style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    padding: '8px',
                    backgroundColor: COLORS.instructorYellow,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        value={day.morningExam?.instructor || ''}
                        onChange={(e) => handleExamChange(day.id, 'morningExam', 'instructor', e.target.value)}
                        placeholder="Enseignant matin"
                        style={{
                          width: '100%',
                          resize: 'none',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          padding: '4px',
                          minHeight: '28px'
                        }}
                      />
                      <textarea
                        value={day.afternoonExam?.instructor || ''}
                        onChange={(e) => day.afternoonExam && handleExamChange(day.id, 'afternoonExam', 'instructor', e.target.value)}
                        placeholder="Enseignant après-midi"
                        style={{
                          width: '100%',
                          resize: 'none',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          background: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          padding: '4px',
                          minHeight: '28px'
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Notes Row */}
              <tr style={{ backgroundColor: COLORS.noticeYellow }}>
                <td style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.noticeYellow,
                  fontWeight: 'bold'
                }}>
                  Notes
                </td>
                <td colSpan={examDays.length} style={{
                  border: `1px solid ${COLORS.borderGray}`,
                  padding: '8px',
                  backgroundColor: COLORS.noticeYellow,
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}>
                  <textarea
                    defaultValue={"La notation 'GREx' signifie groupe d'examen.\nPour connaître votre groupe, consultez l'affichage."}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Add Day Button - positioned at bottom right */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={addNewDay}
              startIcon={<span>+</span>}
            >
              Ajouter un jour
            </Button>
          </Box>
        </div>
      </TableContainer>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>

        <Button
          variant="contained"
          color="success"
          onClick={exportSchedule}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Exporter le calendrier
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={printSchedule}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2h-2M6 14h12v8H6v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Imprimer
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={exportAsImage}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 16l4 4 4-4M8 20V9M16 8l-4-4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Exporter comme image
        </Button>
      </Box>

      {/* Print Styles - Updated to ensure colors print properly */}
      <style>{`
        @media print {
          body {
            font-size: 10pt;
            color: #000;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          input, textarea {
            border: none !important;
            font-size: 10pt !important;
            overflow: visible !important;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          td, th {
            border: 1px solid ${COLORS.borderGray} !important;
            word-wrap: break-word;
          }

          textarea {
            overflow: visible !important;
            height: auto !important;
            background-color: transparent !important;
          }

          button {
            display: none !important;
          }

          /* Force background colors in print */
          .header-background, [style*="background-color: ${COLORS.headerBackground}"] {
            background-color: ${COLORS.headerBackground} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header-secondary, [style*="background-color: ${COLORS.headerSecondary}"] {
            background-color: ${COLORS.headerSecondary} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .session-blue, [style*="background-color: ${COLORS.sessionBlue}"] {
            background-color: ${COLORS.sessionBlue} !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .table-header-blue, [style*="background-color: ${COLORS.tableHeaderBlue}"] {
            background-color: ${COLORS.tableHeaderBlue} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .course-code-green, [style*="background-color: ${COLORS.courseCodeGreen}"] {
            background-color: ${COLORS.courseCodeGreen} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .subject-green, [style*="background-color: ${COLORS.subjectGreen}"] {
            background-color: ${COLORS.subjectGreen} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .time-slot-gray, [style*="background-color: ${COLORS.timeSlotGray}"] {
            background-color: ${COLORS.timeSlotGray} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .duration-gray, [style*="background-color: ${COLORS.durationGray}"] {
            background-color: ${COLORS.durationGray} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .program-yellow, [style*="background-color: ${COLORS.programYellow}"] {
            background-color: ${COLORS.programYellow} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .notice-yellow, [style*="background-color: ${COLORS.noticeYellow}"] {
            background-color: ${COLORS.noticeYellow} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .coordinator-yellow, [style*="background-color: ${COLORS.coordinatorYellow}"] {
            background-color: ${COLORS.coordinatorYellow} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .instructor-yellow, [style*="background-color: ${COLORS.instructorYellow}"] {
            background-color: ${COLORS.instructorYellow} !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }

        /* Additional styles to ensure colors are visible even in browsers that might override them */
        tr[style*="background-color"], td[style*="background-color"], th[style*="background-color"] {
          background-color: inherit !important;
        }

        /* Better text handling for inputs and textareas */
        input[type="text"] {
          overflow: visible;
          white-space: normal;
        }

        textarea {
          overflow: auto;
          line-height: 1.2;
        }

        /* ...existing styles... */
      `}</style>
    </Box>
  );
};

export default GraphicalExamScheduleCreator;
