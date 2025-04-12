import React, { useState } from 'react';
import {
  List, ListItem, ListItemText, Typography, Box, Chip, IconButton,
  Tooltip, CircularProgress, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, OutlinedInput, Button, SelectChangeEvent,
  Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { getStatusColor, getStatusDisplayText, processSessionStatus } from '../../utils/sessionStatus';

interface Session {
  id: string;
  subject: string;
  date: string;
  time: string;
  classroom: string;
  groups: string[] | string; // Can be either an array of strings or a single string
  status: string;
  supervisors?: string[] | string;
  sections?: string[] | string;
  examDuration?: number;
  calculatedStatus?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  examType?: 'devoir_surveille' | 'examen_tp' | 'examen_principal' | 'examen_rattrapage' | string;
  originalData?: any; // For storing the original API response
}

interface SessionsListProps {
  sessions: Session[];
  loading: boolean;
  onSessionClick?: (session: Session) => void;
  onRefresh: () => void;
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
}

const SessionsList: React.FC<SessionsListProps> = ({ sessions, loading, onSessionClick, onRefresh, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Function to filter sessions based on search query, status, and date
  const filterSessions = () => {
    let result = [...sessions];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(session => {
        // Check if subject includes the search query
        const subjectMatch = session.subject.toLowerCase().includes(searchQuery.toLowerCase());

        // Check if classroom includes the search query
        const classroomMatch = session.classroom.toLowerCase().includes(searchQuery.toLowerCase());

        // Check if groups includes the search query
        let groupsMatch = false;
        if (session.groups) {
          // Handle both array and string formats for groups
          if (Array.isArray(session.groups)) {
            groupsMatch = session.groups.some(group =>
              group.toLowerCase().includes(searchQuery.toLowerCase())
            );
          } else if (typeof session.groups === 'string') {
            groupsMatch = session.groups.toLowerCase().includes(searchQuery.toLowerCase());
          }
        }

        return subjectMatch || classroomMatch || groupsMatch;
      });
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter(session => {
        // Handle different status formats
        const sessionStatus = session.status || '';
        const calculatedStatus = session.calculatedStatus || '';
        return sessionStatus === statusFilter || calculatedStatus === statusFilter;
      });
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);

      result = result.filter(session => {
        if (!session.date) return false;

        try {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === filterDate.getTime();
        } catch (error) {
          console.error('Error parsing date:', error);
          return false;
        }
      });
    }

    return result;
  };

  const filteredSessions = filterSessions();

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFilter(null);
  };

  // Use the utility function for status color

  // Handler for opening the session details dialog
  const handleOpenDetails = (session: Session, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedSession(session);
    setDialogOpen(true);

    // Also call the external handler if provided
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  // Handler for closing the session details dialog
  const handleCloseDetails = () => {
    setDialogOpen(false);
    setSelectedSession(null);
  };

  // Handler for edit button click
  const handleEditClick = (session: Session, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(session);
    }
  };

  // Handler for delete button click
  const handleDeleteClick = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = () => {
    if (sessionToDelete && onDelete) {
      onDelete(sessionToDelete);
    }
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  // Handler for canceling deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Tooltip title="Filter">
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              input={<OutlinedInput label="Status" />}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="ongoing">Ongoing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={dateFilter}
              onChange={(newValue) => setDateFilter(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredSessions.length === 0 ? (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="textSecondary">No sessions found</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredSessions.map((session, index) => (
            <React.Fragment key={session.id || index}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                button
                onClick={() => handleOpenDetails(session)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  '&:hover .action-buttons': {
                    opacity: 1,
                  }
                }}
                secondaryAction={
                  <Box className="action-buttons" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                    {onEdit && (
                      <Tooltip title="Edit Session">
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={(e) => handleEditClick(session, e)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Delete Session">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleDeleteClick(session.id, e)}
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{session.subject || 'Unknown Subject'}</Typography>
                      <Chip
                        label={session.date ? new Date(session.date).toLocaleDateString() : 'No Date'}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Time: {session.time || 'Not specified'} | Room: {session.classroom || 'Not assigned'}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="textSecondary">
                        Groups: {Array.isArray(session.groups) ? session.groups.join(', ') : (session.groups || 'None')}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {session.examType && (
                          <Chip
                            label={(() => {
                              switch(session.examType) {
                                case 'devoir_surveille': return 'Devoir Surveillé';
                                case 'examen_tp': return 'Examen TP';
                                case 'examen_principal': return 'Examen Principal';
                                case 'examen_rattrapage': return 'Examen Rattrapage';
                                default: return session.examType || 'Unknown Type';
                              }
                            })()}
                            size="small"
                            color="secondary"
                          />
                        )}
                        <Chip
                          label={getStatusDisplayText(session.status || 'scheduled')}
                          size="small"
                          color={getStatusColor(session.status || 'scheduled')}
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Session Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedSession?.subject || 'Session Details'}
          </Typography>
          <IconButton onClick={handleCloseDetails} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
                      Subject
                    </TableCell>
                    <TableCell>{selectedSession.subject || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Date
                    </TableCell>
                    <TableCell>
                      {selectedSession.date ? new Date(selectedSession.date).toLocaleDateString() : 'Not specified'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Time
                    </TableCell>
                    <TableCell>{selectedSession.time || 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Duration
                    </TableCell>
                    <TableCell>{selectedSession.examDuration ? `${selectedSession.examDuration} minutes` : 'Not specified'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Classroom
                    </TableCell>
                    <TableCell>{selectedSession.classroom || 'Not assigned'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Groups
                    </TableCell>
                    <TableCell>
                      {Array.isArray(selectedSession.groups)
                        ? selectedSession.groups.join(', ')
                        : (selectedSession.groups || 'None')}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Supervisors
                    </TableCell>
                    <TableCell>
                      {Array.isArray(selectedSession.supervisors)
                        ? selectedSession.supervisors.join(', ')
                        : (selectedSession.supervisors || 'None')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Exam Type
                    </TableCell>
                    <TableCell>
                      {selectedSession.examType ? (
                        <Chip
                          label={(() => {
                            switch(selectedSession.examType) {
                              case 'devoir_surveille': return 'Devoir Surveillé';
                              case 'examen_tp': return 'Examen TP';
                              case 'examen_principal': return 'Examen Principal';
                              case 'examen_rattrapage': return 'Examen Rattrapage';
                              default: return selectedSession.examType || 'Unknown Type';
                            }
                          })()}
                          size="small"
                          color="secondary"
                        />
                      ) : 'Not specified'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusDisplayText(selectedSession.status || 'scheduled')}
                        size="small"
                        color={getStatusColor(selectedSession.status || 'scheduled')}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          {onEdit && selectedSession && (
            <Button
              onClick={() => {
                handleCloseDetails();
                if (onEdit) onEdit(selectedSession);
              }}
              color="primary"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
          <Button onClick={handleCloseDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this session? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionsList;
