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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  SelectChangeEvent,
  Fab,
  Card,
  CardContent,
  OutlinedInput,
  InputAdornment,
  Tooltip,
  TablePagination
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

interface Classroom {
  _id: string;
  roomNumber: string;
  capacity: number;
  department: string;
  floor?: number;
  features: string[];
  availability: boolean;
}

interface ClassroomFormData {
  roomNumber: string;
  capacity: number;
  department: string;
  floor?: number;
  features: string[];
  availability: boolean;
}

const initialFormData: ClassroomFormData = {
  roomNumber: '',
  capacity: 30,
  department: '',
  floor: 1,
  features: [],
  availability: true
};

const features = [
  'projector',
  'computers',
  'whiteboard',
  'air_conditioning',
  'heating',
  'internet'
];

const ClassroomManagement: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassroomFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState(0);
  const [floorFilter, setFloorFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [featuresFilter, setFeaturesFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [departments, setDepartments] = useState<{_id: string, name: string}[]>([]);

  // Fetch all classrooms and departments
  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch classrooms
      const classroomsResponse = await axios.get(`${API_URL}/api/classrooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (classroomsResponse.data.success) {
        setClassrooms(classroomsResponse.data.data);
      } else {
        setError('Failed to fetch classrooms');
      }

      // Fetch departments
      const departmentsResponse = await axios.get(`${API_URL}/api/departments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.data);
      } else {
        console.error('Failed to fetch departments');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Initialize filteredClassrooms with all classrooms when classrooms change
  useEffect(() => {
    setFilteredClassrooms(classrooms);
  }, [classrooms]);

  useEffect(() => {
    filterClassrooms();
  }, [classrooms, searchQuery, availabilityFilter, capacityFilter, floorFilter, departmentFilter, featuresFilter]);

  const filterClassrooms = () => {
    let result = [...classrooms];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      result = result.filter(classroom =>
        (classroom.roomNumber && classroom.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (classroom.department && classroom.department.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      const isAvailable = availabilityFilter === 'available';
      result = result.filter(classroom => classroom.availability === isAvailable);
    }

    // Filter by capacity
    if (capacityFilter > 0) {
      result = result.filter(classroom => classroom.capacity >= capacityFilter);
    }

    // Filter by floor
    if (floorFilter !== 'all') {
      const floor = parseInt(floorFilter);
      result = result.filter(classroom => classroom.floor === floor);
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      result = result.filter(classroom => classroom.department === departmentFilter);
    }

    // Filter by features
    if (featuresFilter.length > 0) {
      result = result.filter(classroom =>
        featuresFilter.every(feature => classroom.features.includes(feature))
      );
    }

    setFilteredClassrooms(result);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAvailabilityFilterChange = (e: SelectChangeEvent) => {
    setAvailabilityFilter(e.target.value);
  };

  const handleCapacityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCapacityFilter(parseInt(e.target.value) || 0);
  };

  const handleFloorFilterChange = (e: SelectChangeEvent) => {
    setFloorFilter(e.target.value);
  };

  const handleDepartmentFilterChange = (e: SelectChangeEvent) => {
    setDepartmentFilter(e.target.value);
  };

  const handleFeaturesFilterChange = (feature: string) => {
    setFeaturesFilter(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setCapacityFilter(0);
    setFloorFilter('all');
    setDepartmentFilter('all');
    setFeaturesFilter([]);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // No need for unique buildings anymore

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

  const handleFeatureChange = (feature: string) => {
    setFormData(prevState => {
      if (prevState.features.includes(feature)) {
        return {
          ...prevState,
          features: prevState.features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prevState,
          features: [...prevState.features, feature]
        };
      }
    });
  };

  const handleOpenDialog = (classroom?: Classroom) => {
    if (classroom) {
      // Edit mode
      setFormData({
        roomNumber: classroom.roomNumber,
        floor: classroom.floor,
        capacity: classroom.capacity,
        features: classroom.features,
        availability: classroom.availability,
        department: classroom.department || ''
      });
      setSelectedClassroom(classroom);
      setIsEditing(true);
    } else {
      // Add mode
      setFormData(initialFormData);
      setSelectedClassroom(null);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleOpenDeleteDialog = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedClassroom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the data to send
      const dataToSend = {
        ...formData
      };

      if (isEditing && selectedClassroom) {
        // Update classroom
        const response = await axios.put(
          `${API_URL}/api/classrooms/${selectedClassroom._id}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Classroom updated successfully!' });
          fetchClassrooms();
        }
      } else {
        // Create new classroom
        const response = await axios.post(
          `${API_URL}/api/classrooms`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setAlertMessage({ type: 'success', message: 'Classroom added successfully!' });
          fetchClassrooms();
        }
      }

      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving classroom:', err);
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error saving classroom'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedClassroom) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/classrooms/${selectedClassroom._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAlertMessage({ type: 'success', message: 'Classroom deleted successfully!' });
        fetchClassrooms();
      }
    } catch (err: any) {
      console.error('Error deleting classroom:', err);
      setAlertMessage({
        type: 'error',
        message: err.response?.data?.message || 'Error deleting classroom'
      });
    } finally {
      handleCloseDeleteDialog();
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

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
          <Typography variant="h4">Classroom Management</Typography>
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
            <Tooltip title="Add New Classroom">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => handleOpenDialog()}
                size="small"
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
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="search-classrooms">Search Classrooms</InputLabel>
                    <OutlinedInput
                      id="search-classrooms"
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
                      label="Search Classrooms"
                      placeholder="Search by room number or department"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="availability-filter-label">Filter by Availability</InputLabel>
                    <Select
                      labelId="availability-filter-label"
                      id="availability-filter"
                      value={availabilityFilter}
                      label="Filter by Availability"
                      onChange={handleAvailabilityFilterChange}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Capacity"
                    type="number"
                    value={capacityFilter || ''}
                    onChange={handleCapacityFilterChange}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
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
                        <MenuItem key={dept._id} value={dept.name}>{dept.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="floor-filter-label">Filter by Floor</InputLabel>
                    <Select
                      labelId="floor-filter-label"
                      id="floor-filter"
                      value={floorFilter}
                      label="Filter by Floor"
                      onChange={handleFloorFilterChange}
                    >
                      <MenuItem value="all">All Floors</MenuItem>
                      {Array.from(new Set(classrooms.map(c => c.floor).filter(Boolean))).sort().map(floor => (
                        <MenuItem key={floor} value={floor?.toString()}>{floor}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Filter by Features</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {features.map(feature => (
                      <Chip
                        key={feature}
                        label={feature.replace('_', ' ')}
                        onClick={() => handleFeaturesFilterChange(feature)}
                        color={featuresFilter.includes(feature) ? 'primary' : 'default'}
                        variant={featuresFilter.includes(feature) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear All Filters
                  </Button>
                </Grid>
              </Grid>
              {filteredClassrooms.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No classrooms match your search criteria
                </Alert>
              )}
              {filteredClassrooms.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Found {filteredClassrooms.length} classroom{filteredClassrooms.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Room Number</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClassrooms.length > 0 ? (
                filteredClassrooms
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((classroom) => (
                  <TableRow key={classroom._id}>
                    <TableCell>{classroom.roomNumber}</TableCell>
                    <TableCell>{classroom.capacity}</TableCell>
                    <TableCell>{classroom.department || 'N/A'}</TableCell>
                    <TableCell>{classroom.floor || 'N/A'}</TableCell>
                    <TableCell>
                      {classroom.features.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {classroom.features.map((feature) => (
                            <Chip key={feature} label={feature} size="small" />
                          ))}
                        </Stack>
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={classroom.availability ? 'Available' : 'Unavailable'}
                        color={classroom.availability ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Classroom">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(classroom)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Classroom">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(classroom)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No classrooms found. Add a new classroom to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredClassrooms.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </motion.div>

      {/* Add/Edit Classroom Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Classroom' : 'Add New Classroom'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="roomNumber"
                  name="roomNumber"
                  label="Room Number"
                  type="text"
                  fullWidth
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="floor"
                  name="floor"
                  label="Floor"
                  type="number"
                  fullWidth
                  value={formData.floor}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="capacity"
                  name="capacity"
                  label="Capacity"
                  type="number"
                  fullWidth
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formData.department}
                    label="Department"
                    onChange={handleInputChange}
                    input={<OutlinedInput label="Department" />}
                    renderValue={(selected) => selected as string}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 224,
                          width: 250,
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Select a Department</MenuItem>

                    {/* List existing departments */}
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept.name}>{dept.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>


              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Features</Typography>
                <FormGroup row>
                  {features.map((feature) => (
                    <FormControlLabel
                      key={feature}
                      control={
                        <Checkbox
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                          name={feature}
                        />
                      }
                      label={feature.replace('_', ' ')}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.availability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: e.target.checked
                        })}
                      name="availability"
                    />
                  }
                  label="Available"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditing ? 'Update' : 'Add'} Classroom
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete classroom {selectedClassroom?.roomNumber}? This action cannot be undone.
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

export default ClassroomManagement;
