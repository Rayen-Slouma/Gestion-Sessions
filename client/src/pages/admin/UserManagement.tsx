import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination,
  IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Snackbar, Alert, Fab, Chip, SelectChangeEvent, Grid,
  OutlinedInput, InputAdornment, Tooltip, Card, CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionFab = motion(Fab);
const MotionCard = motion(Card);

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', password: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters whenever users, searchQuery, or roleFilter changes
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const filterUsers = () => {
    let result = [...users];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(result);
    // Reset to first page when filters change
    setPage(0);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users data:', data);

      if (data.success) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error loading users: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e: SelectChangeEvent) => {
    setRoleFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateDialog = () => {
    setIsNewUser(true);
    setFormData({ name: '', email: '', role: 'student', password: '' });
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setIsNewUser(false);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      // Use the data returned from the API
      console.log('User deleted:', data);

      // Refresh the user list
      fetchUsers();
      showSnackbar('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Error deleting user: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  // The form uses handleTextFieldChange and handleSelectChange instead of a generic handleFormChange

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.email || (isNewUser && !formData.password) || !formData.role) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      if (isNewUser) {
        // Create new user
        const userResponse = await fetch(`${apiUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error(userData.message || 'Failed to create user');
        }

        console.log('User created:', userData);

        // If the user is a teacher, create a teacher profile
        if (formData.role === 'teacher' && userData.success && userData.data) {
          try {
            const teacherData = {
              user: userData.data._id,
              department: 'Not specified', // Default department
              availability: [],
              supervisionPreferences: {
                maxExamsPerDay: 2
              }
            };

            const teacherResponse = await fetch(`${apiUrl}/api/teachers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(teacherData)
            });

            const teacherResult = await teacherResponse.json();

            if (!teacherResponse.ok) {
              console.error('Failed to create teacher profile:', teacherResult);
              showSnackbar('User created but failed to create teacher profile', 'warning');
            } else {
              console.log('Teacher profile created:', teacherResult);
              showSnackbar('Teacher created successfully with profile', 'success');
            }
          } catch (teacherError) {
            console.error('Error creating teacher profile:', teacherError);
            showSnackbar('User created but failed to create teacher profile', 'warning');
          }
        } else {
          showSnackbar('User created successfully', 'success');
        }
      } else if (selectedUser) {
        // Update existing user
        const response = await fetch(`${apiUrl}/api/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update user');
        }

        console.log('User updated:', data);

        // If role changed to teacher, check if teacher profile exists and create if not
        if (formData.role === 'teacher' && selectedUser.role !== 'teacher') {
          try {
            const teacherData = {
              user: selectedUser._id,
              department: 'Not specified', // Default department
              availability: [],
              supervisionPreferences: {
                maxExamsPerDay: 2
              }
            };

            const teacherResponse = await fetch(`${apiUrl}/api/teachers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(teacherData)
            });

            const teacherResult = await teacherResponse.json();

            if (!teacherResponse.ok) {
              // If error is not about duplicate teacher profile
              if (!teacherResult.message?.includes('already exists')) {
                console.error('Failed to create teacher profile:', teacherResult);
                showSnackbar('User updated but failed to create teacher profile', 'warning');
              } else {
                showSnackbar('User updated successfully', 'success');
              }
            } else {
              console.log('Teacher profile created:', teacherResult);
              showSnackbar('User updated and teacher profile created', 'success');
            }
          } catch (teacherError) {
            console.error('Error creating teacher profile:', teacherError);
            showSnackbar('User updated but failed to create teacher profile', 'warning');
          }
        } else {
          showSnackbar('User updated successfully', 'success');
        }
      }

      // Refresh the user list
      fetchUsers();
      handleDialogClose();
    } catch (error) {
      console.error('Error submitting user data:', error);
      showSnackbar('Error saving user data: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'primary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
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
              aria-label="add user"
              onClick={handleOpenCreateDialog}
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
              <Grid item xs={12} md={5}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel htmlFor="search-users">Search Users</InputLabel>
                  <OutlinedInput
                    id="search-users"
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
                    label="Search Users"
                    placeholder="Search by name or email"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    id="role-filter"
                    value={roleFilter}
                    label="Filter by Role"
                    onChange={handleRoleFilterChange}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
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
            {filteredUsers.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No users match your search criteria
              </Alert>
            )}
            {filteredUsers.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </CardContent>
        </MotionCard>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={getRoleColor(user.role) as any}
                            />
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditUser(user)} size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteClick(user._id)} size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </motion.div>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isNewUser ? 'Create New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleTextFieldChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleTextFieldChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleSelectChange}
            >
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="password"
            label={isNewUser ? "Password" : "New Password (leave blank to keep current)"}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleTextFieldChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isNewUser ? 'Create' : 'Save Changes'}
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
            Are you sure you want to delete this user? This action cannot be undone.
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
