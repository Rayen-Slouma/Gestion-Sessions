import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Paper, Button, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Grid, SelectChangeEvent, Chip,
  Fab, Card, CardContent, OutlinedInput, InputAdornment, Tooltip, TablePagination
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
import axios from 'axios';
import { API_URL } from '../../config';
import { Section } from '../../types';

export {};

interface Group {
  _id: string;
  name: string;
  size: number;
  section: {
    _id: string;
    name: string;
  };
  subjects?: Array<string | { _id: string; name: string; code: string }>;
  students?: string[];
}

interface GroupFormData {
  name: string;
  size: number;
  section: string;
  subjects: string[];
}

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    size: 30, // Default size
    section: '',
    subjects: []
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setGroups(response.data.data);
      } else {
        setError('Failed to fetch groups');
      }
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sections and subjects for dropdown
  const fetchDropdownData = useCallback(async () => {
    try {
      const [sectionsResponse, subjectsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/sections`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        axios.get(`${API_URL}/api/subjects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (sectionsResponse.data.success) {
        setSections(sectionsResponse.data.data);
      }

      if (subjectsResponse.data.success) {
        setSubjects(subjectsResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load sections or subjects');
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchDropdownData();
  }, [fetchGroups, fetchDropdownData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as unknown as string[];
    setFormData({
      ...formData,
      subjects: value,
    });
  };

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      // Edit mode
      // Check if subjects is an array of objects or strings
      let subjectIds: string[] = [];

      if (group.subjects) {
        // If subjects are objects with _id property, extract the IDs
        if (typeof group.subjects[0] === 'object' && group.subjects[0] !== null) {
          subjectIds = group.subjects.map((subject: any) => subject._id);
        } else {
          // If subjects are already strings (IDs), use them directly
          subjectIds = group.subjects as string[];
        }
      }

      setFormData({
        name: group.name,
        size: group.size,
        section: group.section._id,
        subjects: subjectIds
      });
      setSelectedGroup(group);
      setIsEditing(true);
    } else {
      // Create mode
      setFormData({
        name: '',
        size: 30,
        section: '',
        subjects: []
      });
      setSelectedGroup(null);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleOpenDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data on submit:', formData);

    if (!formData.name || !formData.section || formData.size <= 0) {
      console.log('Validation failed:', { name: formData.name, section: formData.section, size: formData.size });
      setAlertMessage({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      if (isEditing && selectedGroup) {
        // Update group
        console.log('Updating group:', selectedGroup._id, formData);
        const response = await axios.put(
          `${API_URL}/api/groups/${selectedGroup._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        console.log('Update response:', response.data);

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Group updated successfully!' });
          fetchGroups();
        }
      } else {
        // Create new group
        console.log('Creating new group:', formData);
        const response = await axios.post(
          `${API_URL}/api/groups`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        console.log('Create response:', response.data);

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Group added successfully!' });
          fetchGroups();
        }
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving group:', err);
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error saving group'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/groups/${selectedGroup._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Group deleted successfully!' });
        fetchGroups();
      }
    } catch (err: any) {
      console.error('Error deleting group:', err);
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting group'
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };



  // Filter groups based on search query and section filter
  const filteredGroups = groups.filter(group => {
    // Skip groups with missing required properties
    if (!group.name || !group.section || !group.section.name || !group.section._id) {
      return false;
    }

    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.section.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSection =
      sectionFilter === 'all' ||
      group.section._id === sectionFilter;

    return matchesSearch && matchesSection;
  });

  const handleSectionFilterChange = (event: SelectChangeEvent) => {
    setSectionFilter(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSectionFilter('all');
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
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

      <motion.div variants={itemVariants}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Group Management</Typography>
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
            <Tooltip title="Add New Group">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => handleOpenDialog()}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>

        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="search-groups">Search Groups</InputLabel>
                    <OutlinedInput
                      id="search-groups"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                      label="Search Groups"
                      placeholder="Search by name or section"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel id="section-filter-label">Filter by Section</InputLabel>
                    <Select
                      labelId="section-filter-label"
                      id="section-filter"
                      value={sectionFilter}
                      label="Filter by Section"
                      onChange={handleSectionFilterChange}
                    >
                      <MenuItem value="all">All Sections</MenuItem>
                      {sections.map(section => (
                        <MenuItem key={section._id} value={section._id}>
                          {section.name}
                        </MenuItem>
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
              {filteredGroups.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No groups match your search criteria
                </Alert>
              )}
              {filteredGroups.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Found {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        <Paper>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Subjects</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGroups.length > 0 ? filteredGroups
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(group => (
                    <TableRow key={group._id}>
                      <TableCell>{group.name}</TableCell>
                      <TableCell>{group.size}</TableCell>
                      <TableCell>{group.section.name}</TableCell>
                      <TableCell>
                        {group.subjects && group.subjects.length > 0 ?
                          `${group.subjects.length} subject(s)` :
                          'No subjects'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Group">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(group)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Group">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(group)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No groups found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredGroups.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </Paper>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isEditing ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Size"
                name="size"
                type="number"
                value={formData.size}
                onChange={handleInputChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Section</InputLabel>
                <Select
                  name="section"
                  value={formData.section}
                  label="Section"
                  onChange={handleInputChange}
                >
                  {sections.map(section => (
                    <MenuItem key={section._id} value={section._id}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {sections.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Please create sections in the Section Management module first.
                </Alert>
              )}

            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  name="subjects"
                  value={formData.subjects}
                  label="Subjects"
                  onChange={handleSubjectsChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const subject = subjects.find(s => s._id === value);
                        return (
                          <Chip
                            key={value}
                            label={subject ? `${subject.name} (${subject.code})` : value}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the group "{selectedGroup?.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


    </motion.div>
  );
};

export default GroupManagement;
