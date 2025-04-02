import React, { useState } from 'react';
import { Box, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  year: string;
  semester: string;
  session: string;
  coordinator: string;
  programCode: string;
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

// More vibrant color definitions that will definitely show up
const COLORS = {
  // Header colors
  headerBackground: '#FFFFFF',
  headerSecondary: '#F5F5F5',
  sessionBlue: '#0047AB',
  tableHeaderBlue: '#E6F0F8',
  
  // Exam rows colors
  courseCodeGreen: '#E6F7E6',
  subjectGreen: '#E6F7E6',
  timeSlotGray: '#F0F0F0',
  durationGray: '#F0F0F0',
  
  // Footer colors
  programYellow: '#FFF9E6',
  noticeYellow: '#FFF9E6',
  coordinatorYellow: '#FFEFB8',
  instructorYellow: '#FFF9E6',
  
  // Borders
  borderGray: '#D3D3D3'
};

const GraphicalExamScheduleCreator: React.FC = () => {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    faculty: 'Faculté des Sciences de Tunis',
    department: 'Ingénieur en Informatique (Genie Logiciel)',
    year: 'Deuxième Année | Examens',
    semester: 'Premier semestre / Session Principale',
    session: 'IGL 4',
    coordinator: 'Asma Amdouni',
    programCode: 'IGL4 : Etudiants'
  });

  const [examDays, setExamDays] = useState<ExamDay[]>([
    {
      id: 'day-1',
      date: '07/01/2025',
      dayName: 'Mardi',
      morningExam: {
        id: 'exam-1',
        code: 'IGL 542',
        subject: 'Technologies web et Multimedia',
        instructor: 'Aymen Sellaouti',
        room: 'S31',
        capacity: '',
        location: ''
      },
      afternoonExam: {
        id: 'exam-2',
        code: 'IGL 553',
        subject: 'Gestion d\'entreprise',
        instructor: 'Wejda Ochi',
        room: '',
        capacity: '',
        location: ''
      }
    },
    {
      id: 'day-2',
      date: '08/01/2025',
      dayName: 'Mercredi',
      morningExam: {
        id: 'exam-3',
        code: 'IGL 521',
        subject: 'Conception et Mise en Oeuvre des SID',
        instructor: 'Asma Amdouni',
        room: 'Code Salle 13',
        capacity: '',
        location: ''
      },
      afternoonExam: {
        id: 'exam-4',
        code: 'IGL 511',
        subject: 'Optimisation Combinatoire',
        instructor: 'Houda Alaya',
        room: '',
        capacity: '',
        location: ''
      }
    },
    {
      id: 'day-3',
      date: '09/01/2025',
      dayName: 'Jeudi',
      morningExam: {
        id: 'exam-5',
        code: 'IGL 532',
        subject: 'Architecture & Algo Parallèle',
        instructor: 'Yosr Slama',
        room: 'Situé à Dep Math1',
        capacity: '',
        location: ''
      },
      afternoonExam: {
        id: 'exam-6',
        code: 'IGL 561',
        subject: 'Blockchain',
        instructor: 'Hela Kaffal',
        room: '',
        capacity: '',
        location: ''
      }
    },
    {
      id: 'day-4',
      date: '10/01/2025',
      dayName: 'Vendredi',
      morningExam: {
        id: 'exam-7',
        code: 'IGL 531',
        subject: 'SOA & Cloud',
        instructor: 'Haitham Abbas',
        room: '',
        capacity: 'Capacité 45',
        location: ''
      },
      afternoonExam: {
        id: 'exam-8',
        code: 'IGL 541',
        subject: 'Cryptographie et Securité',
        instructor: 'Hela Kaffal',
        room: '',
        capacity: '',
        location: ''
      }
    },
    {
      id: 'day-5',
      date: '11/01/2025',
      dayName: 'Samedi',
      morningExam: {
        id: 'exam-9',
        code: 'IGL 512',
        subject: 'Processus Stochastique',
        instructor: 'Sana Younes',
        room: '',
        capacity: '',
        location: ''
      },
      afternoonExam: null
    },
    {
      id: 'day-6',
      date: '13/01/2025',
      dayName: 'Lundi',
      morningExam: {
        id: 'exam-10',
        code: 'IGL 522',
        subject: 'Intelligence Artificielle',
        instructor: 'Naries Doggaz',
        room: '',
        capacity: '',
        location: ''
      },
      afternoonExam: null
    }
  ]);

  const [sectionInfo, setSectionInfo] = useState('Section IGL4 - 28 Etudiants');

  // Handler for header info changes
  const handleHeaderChange = (field: keyof HeaderInfo, value: string) => {
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

  // Function to add a new day to the schedule
  const addNewDay = () => {
    const newDayId = `day-${examDays.length + 1}`;
    const newDay: ExamDay = {
      id: newDayId,
      date: '',
      dayName: '',
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
    
    setExamDays([...examDays, newDay]);
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Information Section */}
      <TableContainer elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ p: 2, mb: 3, border: '1px solid rgba(224, 224, 224, 0.7)', borderRadius: 1 }}>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>Information d'en-tête</h2>
          </Box>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Faculté</label>
              <input
                type="text"
                value={headerInfo.faculty}
                onChange={(e) => handleHeaderChange('faculty', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Département</label>
              <input
                type="text"
                value={headerInfo.department}
                onChange={(e) => handleHeaderChange('department', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Année</label>
              <input
                type="text"
                value={headerInfo.year}
                onChange={(e) => handleHeaderChange('year', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Semestre/Session</label>
              <input
                type="text"
                value={headerInfo.semester}
                onChange={(e) => handleHeaderChange('semester', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Code de session</label>
              <input
                type="text"
                value={headerInfo.session}
                onChange={(e) => handleHeaderChange('session', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Coordinateur</label>
              <input
                type="text"
                value={headerInfo.coordinator}
                onChange={(e) => handleHeaderChange('coordinator', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Code du programme</label>
              <input
                type="text"
                value={headerInfo.programCode}
                onChange={(e) => handleHeaderChange('programCode', e.target.value)}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid rgba(0, 0, 0, 0.23)', 
                  borderRadius: '4px' 
                }}
              />
            </div>
          </div>
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
                    <div style={{ textAlign: 'center', flexGrow: 1 }}>
                      <input
                        type="text"
                        value={headerInfo.department}
                        onChange={(e) => handleHeaderChange('department', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', fontWeight: 'bold', textAlign: 'center', color: '#1976d2' }}
                      />
                      <input
                        type="text"
                        value={headerInfo.year}
                        onChange={(e) => handleHeaderChange('year', e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center' }}
                      />
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
                    value={headerInfo.session}
                    onChange={(e) => handleHeaderChange('session', e.target.value)}
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
                    width: `${100 / examDays.length}%`
                  }}>
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) => {
                        const updatedDays = examDays.map(d => 
                          d.id === day.id ? { ...d, dayName: e.target.value } : d
                        );
                        setExamDays(updatedDays);
                      }}
                      style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center', fontWeight: 'bold' }}
                    />
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
                    <input
                      type="text"
                      value={day.date}
                      onChange={(e) => {
                        const updatedDays = examDays.map(d => 
                          d.id === day.id ? { ...d, date: e.target.value } : d
                        );
                        setExamDays(updatedDays);
                      }}
                      style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'center' }}
                    />
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
                        <textarea
                          value={day.morningExam.subject}
                          onChange={(e) => handleExamChange(day.id, 'morningExam', 'subject', e.target.value)}
                          style={{ 
                            width: '100%',
                            flexGrow: 1,
                            resize: 'none',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            padding: '2px'
                          }}
                        />
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
                        <textarea
                          value={day.afternoonExam.subject}
                          onChange={(e) => handleExamChange(day.id, 'afternoonExam', 'subject', e.target.value)}
                          style={{ 
                            width: '100%',
                            flexGrow: 1,
                            resize: 'none',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            padding: '2px'
                          }}
                        />
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
                    value={sectionInfo}
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
                  <div>
                    La notation "GREx" signifie groupe d'examen.<br />
                    Pour connaître votre groupe, consultez l'affichage.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TableContainer>
      
      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={addNewDay}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        >
          Ajouter un jour
        </Button>
        
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
