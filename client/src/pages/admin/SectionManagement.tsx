import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Fab,
  Card,
  CardContent,
  OutlinedInput,
  InputAdornment,
  Tooltip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Section {
  _id: string;
  name: string;
  code: string;
  department: Department;
  createdAt: string;
}

interface SectionFormData {
  name: string;
  code: string;
  department: string;
}

const initialFormData: SectionFormData = {
  name: '',
  code: '',
  department: ''
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const SectionManagement: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SectionFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  // Fetch all sections
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/sections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSections(response.data.data);
      } else {
        setError('Failed to fetch sections');
      }
    } catch (err: any) {
      // Error fetching sections
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/departments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setDepartments(response.data.data);
      } else {
        // Failed to fetch departments
      }
    } catch (err: any) {
      // Error fetching departments
    }
  }, []);

  useEffect(() => {
    fetchSections();
    fetchDepartments();
  }, [fetchSections, fetchDepartments]);

  useEffect(() => {
    setFilteredSections(sections);
  }, [sections]);

  useEffect(() => {
    filterSections();
  }, [sections, searchQuery, departmentFilter]);

  const filterSections = () => {
    let result = [...sections];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(section =>
        (section.name && section.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (section.code && section.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (section.department && section.department.name && section.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      result = result.filter(section => section.department && section.department._id === departmentFilter);
    }

    setFilteredSections(result);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDepartmentFilterChange = (e: SelectChangeEvent) => {
    setDepartmentFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      // Edit mode
      setFormData({
        name: section.name,
        code: section.code,
        department: section.department._id
      });
      setSelectedSection(section);
      setIsEditing(true);
    } else {
      // Add mode
      setFormData(initialFormData);
      setSelectedSection(null);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDeleteDialog = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedSection) {
        // Update section
        const response = await axios.put(
          `${API_URL}/api/sections/${selectedSection._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Section updated successfully!' });
          fetchSections();
        }
      } else {
        // Create new section
        const response = await axios.post(
          `${API_URL}/api/sections`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Section added successfully!' });
          fetchSections();
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      // Error saving section
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error saving section'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedSection) return;

    try {
      const response = await axios.delete(`${API_URL}/api/sections/${selectedSection._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Section deleted successfully!' });
        fetchSections();
      }
      handleCloseDeleteDialog();
    } catch (err: any) {
      // Error deleting section
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting section'
      });
      handleCloseDeleteDialog();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >


      {alertMessage && (
        <motion.div variants={itemVariants}>
          <Alert
            severity={alertMessage.type}
            onClose={() => setAlertMessage(null)}
            sx={{ mb: 2 }}
          >
            {alertMessage.message}
          </Alert>
        </motion.div>
      )}

      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Section Management</Typography>
          <Box>
            <Tooltip title="Toggle Filters">
              <Fab
                color="secondary"
                aria-label="filter"
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{ mr: 2 }}
              >
                <FilterListIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="Add New Section">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => handleOpenDialog()}
                size="small"
                disabled={departments.length === 0}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>

        {departments.length === 0 && !loading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You need to create at least one department before you can add sections.
          </Alert>
        )}

        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="search-sections">Search Sections</InputLabel>
                    <OutlinedInput
                      id="search-sections"
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
                      label="Search Sections"
                      placeholder="Search by name, code, or department"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="department-filter-label">Filter by Department</InputLabel>
                    <Select
                      labelId="department-filter-label"
                      id="department-filter"
                      value={departmentFilter}
                      label="Filter by Department"
                      onChange={handleDepartmentFilterChange}
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      {departments.map(dept => (
                        <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                      ))}
                    </Select>
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
              {filteredSections.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No sections match your search criteria
                </Alert>
              )}
              {filteredSections.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing {filteredSections.length} sections
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader aria-label="sections table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSections.length > 0 ? (
                    filteredSections
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((section) => (
                        <TableRow key={section._id}>
                          <TableCell>{section.name}</TableCell>
                          <TableCell>{section.code}</TableCell>
                          <TableCell>{section.department?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(section)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(section)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {loading ? 'Loading...' : 'No sections found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSections.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </motion.div>

      {/* Add/Edit Section Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Section' : 'Add New Section'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  name="name"
                  label="Section Name"
                  type="text"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="code"
                  name="code"
                  label="Section Code"
                  type="text"
                  fullWidth
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    label="Department"
                    onChange={handleInputChange}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the section "{selectedSection?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default SectionManagement;
