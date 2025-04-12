import React, { useState, useContext } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar,
  Collapse, Typography, Box, AppBar, IconButton, Avatar,
  Divider, Button, Tooltip, CssBaseline
} from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SchoolIcon from '@mui/icons-material/School';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const expandedDrawerWidth = 280; // Increased from 240 to accommodate longer text
const collapsedDrawerWidth = 70;

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [generalManagementOpen, setGeneralManagementOpen] = useState(true);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);

  // Calculate current drawer width based on expanded state
  const drawerWidth = isDrawerExpanded ? expandedDrawerWidth : collapsedDrawerWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawerExpanded = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGeneralManagementClick = () => {
    setGeneralManagementOpen(!generalManagementOpen);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardCustomizeIcon sx={{ color: '#3b82f6' }} />,
      path: '/admin/dashboard',
    },
    {
      text: 'Schedule Management',
      icon: <EventNoteIcon sx={{ color: '#8b5cf6' }} />,
      path: '/admin/schedule',
    }
  ];

  const generalManagementItems = [
    {
      text: 'User Management',
      icon: <ManageAccountsIcon sx={{ color: '#ec4899' }} />,
      path: '/admin/users',
    },
    {
      text: 'Department Management',
      icon: <ApartmentIcon sx={{ color: '#f59e0b' }} />,
      path: '/admin/departments',
    },
    {
      text: 'Section Management',
      icon: <SchoolIcon sx={{ color: '#10b981' }} />,
      path: '/admin/sections',
    },
    {
      text: 'Subject Management',
      icon: <AutoStoriesIcon sx={{ color: '#6366f1' }} />,
      path: '/admin/subjects',
    },
    {
      text: 'Group Management',
      icon: <Diversity3Icon sx={{ color: '#0ea5e9' }} />,
      path: '/admin/groups',
    },
    {
      text: 'Classroom Management',
      icon: <MeetingRoomIcon sx={{ color: '#14b8a6' }} />,
      path: '/admin/classrooms',
    },
  ];

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile backdrop - only visible on small screens when drawer is expanded */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          display: { xs: 'block', sm: 'none' },
          opacity: isDrawerExpanded ? 1 : 0,
          pointerEvents: isDrawerExpanded ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={toggleDrawerExpanded}
      />
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
          color: 'white',
          transition: 'all 0.3s ease',
          width: '100%',
          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: '70px',
            px: { xs: 2, md: 4 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={toggleDrawerExpanded}
              sx={{ mr: 2 }}
            >
              {isDrawerExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    fontWeight: 700,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    letterSpacing: '0.5px'
                  }}
                >
                  University Exam Management
                </Typography>
              </Box>
            </motion.div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 2,
                  py: 0.5,
                  px: 2,
                  borderRadius: '24px',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Tooltip title={user?.role || ''}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#fde68a',
                      color: '#b45309',
                      mr: 1.5,
                      fontSize: '0.875rem',
                      border: '2px solid rgba(255, 255, 255, 0.7)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </Avatar>
                </Tooltip>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user?.name || 'Admin'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textTransform: 'capitalize',
                      opacity: 0.9,
                    }}
                  >
                    {user?.role || 'admin'}
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                startIcon={<LogoutIcon fontSize="small" />}
                sx={{
                  borderRadius: '20px',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  },
                  textTransform: 'none',
                  px: 2
                }}
              >
                Logout
              </Button>
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          position: { xs: 'fixed', sm: 'fixed' }, // Use fixed for all screen sizes for better animation
          width: drawerWidth,
          flexShrink: 0,
          zIndex: (theme) => theme.zIndex.drawer,
          display: 'block', // Always display the container
          transition: theme => theme.transitions.create(['width', 'transform'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: 'block',
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: { xs: '4px 0 10px rgba(0, 0, 0, 0.05)', sm: 'none' }, // Add shadow on mobile
              background: 'linear-gradient(180deg, rgba(249,250,251,0.95) 0%, rgba(248,250,252,0.9) 100%)',
              backdropFilter: 'blur(10px)',
              overflowX: 'hidden',
              // Apply transform for all screen sizes
              transform: isDrawerExpanded ? 'translateX(0)' : 'translateX(-100%)',
              // Add animation for all screen sizes
              transition: theme => theme.transitions.create(['width', 'transform'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: isDrawerExpanded ? 'flex-end' : 'center', px: [1] }}>
          <IconButton
            onClick={toggleDrawerExpanded}
            sx={{
              display: 'flex',
              minWidth: 0,
              padding: 1,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            {isDrawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <Tooltip title={!isDrawerExpanded ? item.text : ""} placement="right">
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                  borderRadius: '8px',
                  my: 0.5,
                  mx: 1,
                  minHeight: 48,
                  justifyContent: isDrawerExpanded ? 'initial' : 'center',
                  px: 2.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isDrawerExpanded ? 2 : 'auto', // Reduced margin from 3 to 2 to give more space for text
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.4rem',
                      filter: location.pathname === item.path ? 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' : 'none',
                      transform: location.pathname === item.path ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {isDrawerExpanded && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      fontSize: '0.95rem',
                      letterSpacing: '0.2px',
                      noWrap: true,
                      sx: {
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingRight: 1
                      }
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}

          <Divider sx={{ my: 2, mx: 2, opacity: 0.6 }} />

          {/* General Management Section */}
          <Tooltip title={!isDrawerExpanded ? "General Management" : ""} placement="right">
            <ListItem
              onClick={handleGeneralManagementClick}
              sx={{
                cursor: 'pointer',
                borderRadius: '8px',
                my: 0.5,
                mx: 1,
                minHeight: 48,
                justifyContent: isDrawerExpanded ? 'initial' : 'center',
                px: 2.5,
                transition: 'all 0.2s ease',
                backgroundColor: generalManagementOpen ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: generalManagementOpen ? 'rgba(239, 68, 68, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                mr: isDrawerExpanded ? 2 : 'auto', // Reduced margin from 3 to 2 to give more space for text
                justifyContent: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem',
                  filter: generalManagementOpen ? 'drop-shadow(0 0 2px rgba(239,68,68,0.3))' : 'none',
                  transform: generalManagementOpen ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }
              }}>
                <SettingsSuggestIcon sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              {isDrawerExpanded && (
                <>
                  <ListItemText
                    primary="General Management"
                    primaryTypographyProps={{
                      fontWeight: generalManagementOpen ? 600 : 400,
                      fontSize: '0.9rem', // Slightly smaller font size
                      letterSpacing: '0px', // Removed letter spacing
                      noWrap: true,
                      sx: {
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingRight: 1,
                        maxWidth: '170px' // Increased width to accommodate longer text
                      }
                    }}
                  />
                  {generalManagementOpen ?
                    <ExpandLess sx={{ color: '#ef4444', transition: 'all 0.3s ease' }} /> :
                    <ExpandMore sx={{ transition: 'all 0.3s ease' }} />}
                </>
              )}
            </ListItem>
          </Tooltip>

          <Collapse in={generalManagementOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {generalManagementItems.map((item) => (
                <Tooltip title={!isDrawerExpanded ? item.text : ""} placement="right">
                  <ListItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      pl: isDrawerExpanded ? 4 : 2.5,
                      borderRadius: '8px',
                      my: 0.5,
                      mx: 1,
                      minHeight: 48,
                      justifyContent: isDrawerExpanded ? 'initial' : 'center',
                      transition: 'all 0.2s ease',
                      backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isDrawerExpanded ? 2 : 'auto', // Reduced margin from 3 to 2 to give more space for text
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': {
                          fontSize: '1.3rem',
                          filter: location.pathname === item.path ? 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' : 'none',
                          transform: location.pathname === item.path ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {isDrawerExpanded && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 600 : 400,
                          fontSize: '0.9rem',
                          letterSpacing: '0.2px',
                          noWrap: true,
                          sx: {
                            transition: 'all 0.2s ease',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            paddingRight: 1
                          }
                        }}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Collapse>
        </List>
      </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          marginLeft: { xs: 0, sm: `${drawerWidth}px` },
          marginTop: '70px',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;