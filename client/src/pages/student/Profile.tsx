import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem,
  Button, Card, CardContent, Avatar, Divider, CircularProgress,
  FormControl, InputLabel, Select, Alert, Snackbar, SelectChangeEvent
} from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';
import { API_URL } from '../../config';

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    section: '',
    group: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Fetch sections and groups
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch sections
        const sectionsResponse = await axios.get(`${API_URL}/api/sections`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data);
        }

        // Fetch groups
        const groupsResponse = await axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (groupsResponse.data.success) {
          setGroups(groupsResponse.data.data);
        }

        // Fetch current user profile data
        const profileResponse = await axios.get(`${API_URL}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.data.success && profileResponse.data.data) {
          setFormData({
            section: profileResponse.data.data.section?._id || '',
            group: profileResponse.data.data.group?._id || ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter groups when section changes
  useEffect(() => {
    if (formData.section) {
      const filtered = groups.filter(group =>
        group.section && group.section._id === formData.section
      );
      setFilteredGroups(filtered);

      // Reset group selection if current selection is not in filtered list
      if (formData.group && !filtered.some(g => g._id === formData.group)) {
        setFormData(prev => ({ ...prev, group: '' }));
      }
    } else {
      setFilteredGroups([]);
      setFormData(prev => ({ ...prev, group: '' }));
    }
  }, [formData.section, groups]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/api/students/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update the selected section and group display
        const updatedProfile = response.data.data;

        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });

        // Navigate to the exam schedule page after a short delay
        setTimeout(() => {
          navigate('/student/exams');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get section and group names for display
  const selectedSection = sections.find(s => s._id === formData.section);
  const selectedGroup = groups.find(g => g._id === formData.group);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1e40af' }}>
          Student Profile
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
          Manage your profile information and academic details
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: '#bfdbfe',
                    color: '#1e40af',
                    fontSize: '2.5rem',
                    margin: '0 auto 16px',
                    border: '4px solid rgba(191, 219, 254, 0.5)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {user?.email}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'left', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ color: '#3b82f6', mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Student
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: '#8b5cf6', mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Section
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedSection ? `${selectedSection.name} (${selectedSection.code})` : 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ color: '#8b5cf6', mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Group
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedGroup ? selectedGroup.name : 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#3b82f6' }}>
                Academic Information
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="section-label">Section</InputLabel>
                        <Select
                          labelId="section-label"
                          id="section"
                          name="section"
                          value={formData.section}
                          label="Section"
                          onChange={handleSelectChange}
                        >
                          {sections.map(section => (
                            <MenuItem key={section._id} value={section._id}>
                              {section.name} ({section.code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!formData.section}>
                        <InputLabel id="group-label">Group</InputLabel>
                        <Select
                          labelId="group-label"
                          id="group"
                          name="group"
                          value={formData.group}
                          label="Group"
                          onChange={handleSelectChange}
                        >
                          {filteredGroups.map(group => (
                            <MenuItem key={group._id} value={group._id}>
                              {group.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={saving}
                          sx={{
                            px: 4,
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                            }
                          }}
                        >
                          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
