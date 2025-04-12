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
  createdAt: string;
}

interface DepartmentFormData {
  name: string;
  code: string;
}

const initialFormData: DepartmentFormData = {
  name: '',
  code: ''
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

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/departments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setDepartments(response.data.data);
      } else {
        setError('Failed to fetch departments');
      }
    } catch (err: any) {
      // Error fetching departments
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    setFilteredDepartments(departments);
  }, [departments]);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchQuery]);

  const filterDepartments = () => {
    let result = [...departments];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(department =>
        (department.name && department.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (department.code && department.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredDepartments(result);
    setPage(0); // Reset to first page when filters change
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

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      // Edit mode
      setFormData({
        name: department.name,
        code: department.code
      });
      setSelectedDepartment(department);
      setIsEditing(true);
    } else {
      // Add mode
      setFormData(initialFormData);
      setSelectedDepartment(null);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedDepartment) {
        // Update department
        const response = await axios.put(
          `${API_URL}/api/departments/${selectedDepartment._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Department updated successfully!' });
          fetchDepartments();
        }
      } else {
        // Create new department
        const response = await axios.post(
          `${API_URL}/api/departments`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Department added successfully!' });
          fetchDepartments();
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      // Error saving department
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error saving department'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const response = await axios.delete(`${API_URL}/api/departments/${selectedDepartment._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Department deleted successfully!' });
        fetchDepartments();
      }
      handleCloseDeleteDialog();
    } catch (err: any) {
      // Error deleting department
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting department'
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
      <Typography variant="h4" gutterBottom component={motion.h4} variants={itemVariants}>
        Department Management
      </Typography>

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
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Department
          </Button>
        </Box>

        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={10}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="search-departments">Search Departments</InputLabel>
                    <OutlinedInput
                      id="search-departments"
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
                      label="Search Departments"
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
              {filteredDepartments.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No departments match your search criteria
                </Alert>
              )}
              {filteredDepartments.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing {filteredDepartments.length} departments
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
              <Table stickyHeader aria-label="departments table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((department) => (
                        <TableRow key={department._id}>
                          <TableCell>{department.name}</TableCell>
                          <TableCell>{department.code}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(department)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(department)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        {loading ? 'Loading...' : 'No departments found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredDepartments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </motion.div>

      {/* Add/Edit Department Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Department' : 'Add New Department'}
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
                  label="Department Name"
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
                  label="Department Code"
                  type="text"
                  fullWidth
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
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
            Are you sure you want to delete the department "{selectedDepartment?.name}"? This action cannot be undone.
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

export default DepartmentManagement;
