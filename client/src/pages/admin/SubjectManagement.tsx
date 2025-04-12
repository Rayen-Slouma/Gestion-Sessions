import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Button,
  TextField, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert as MuiAlert, Fab, Card, CardContent,
  FormControl, InputLabel, OutlinedInput, InputAdornment,
  TablePagination, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import api from '../../services/apiService';
import { Subject } from '../../types';
import { motion } from 'framer-motion';

const MotionFab = motion(Fab);
const MotionCard = motion(Card);

const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Apply filters whenever subjects or searchQuery changes
    filterSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, searchQuery]);

  const filterSubjects = () => {
    let result = [...subjects];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(subject =>
        // Skip subjects with missing required properties
        subject && subject.name && subject.code && (
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredSubjects(result);
    // Reset to first page when filters change
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/subjects');
      if (response.data.success) {
        setSubjects(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch subjects');
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      setError(error.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setCurrentSubject(subject);
      setIsEditing(true);
    } else {
      setCurrentSubject({
        name: '',
        code: '',
        examDuration: 120,
        credits: 3,
        department: 'General'
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSubject(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSubject(prev => {
      if (!prev) return null;

      // Ensure required fields are always present
      const updatedSubject = { ...prev, [name]: value };
      if (!updatedSubject.examDuration) updatedSubject.examDuration = 120;
      if (!updatedSubject.credits) updatedSubject.credits = 3;
      if (!updatedSubject.department) updatedSubject.department = 'General';

      return updatedSubject;
    });
  };


  const handleSubmit = async () => {
    if (!currentSubject) return;

    try {
      setLoading(true);
      let response;

      if (isEditing && currentSubject._id) {
        response = await api.put(`/api/subjects/${currentSubject._id}`, currentSubject);
      } else {
        response = await api.post('/api/subjects', currentSubject);
      }

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: isEditing ? 'Subject updated successfully' : 'Subject created successfully',
          severity: 'success'
        });
        fetchSubjects();
        handleCloseDialog();
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving subject:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSubjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      setLoading(true);
      const response = await api.delete(`/api/subjects/${subjectToDelete}`);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Subject deleted successfully',
          severity: 'success'
        });
        fetchSubjects();
      } else {
        throw new Error(response.data.message || 'Delete operation failed');
      }
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && subjects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Subject Management</Typography>
          <Box>
            <MotionFab
              color="secondary"
              aria-label="filter"
              onClick={() => setShowFilters(!showFilters)}
              size="medium"
              sx={{ mr: 2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FilterListIcon />
            </MotionFab>
            <MotionFab
              color="primary"
              aria-label="add subject"
              onClick={() => handleOpenDialog()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AddIcon />
            </MotionFab>
          </Box>
        </Box>
      </motion.div>

      {showFilters && (
        <MotionCard
          sx={{ mb: 3 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={10}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="search-subjects">Search Subjects</InputLabel>
                  <OutlinedInput
                    id="search-subjects"
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
                    label="Search Subjects"
                    placeholder="Search by name or code"
                  />
                </FormControl>
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
            </Grid>
            {filteredSubjects.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No subjects match your search criteria
              </Alert>
            )}
            {filteredSubjects.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Found {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </CardContent>
        </MotionCard>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit Subject">
                      <IconButton onClick={() => handleOpenDialog(subject)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Subject">
                      <IconButton onClick={() => handleDeleteClick(subject._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No subjects found. Add your first subject!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSubjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Subject names can be duplicated, but subject codes must be unique.
          </Alert>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Name"
                  name="name"
                  value={currentSubject?.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Code"
                  name="code"
                  value={currentSubject?.code || ''}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              {/* Hidden fields to satisfy model requirements */}
              <input type="hidden" name="examDuration" value="120" />
              <input type="hidden" name="credits" value="3" />
              <input type="hidden" name="department" value="General" />
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            Are you sure you want to delete this subject? This action cannot be undone.
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default SubjectManagement;
