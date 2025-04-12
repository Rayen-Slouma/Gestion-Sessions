import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Button, Avatar, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import BackgroundPattern from '../components/common/BackgroundPattern';

const expandedDrawerWidth = 260;
const collapsedDrawerWidth = 70;

const MainLayout: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Menu items based on user role
  const menuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Schedule Generation', icon: <ScheduleIcon />, path: '/admin/schedule' },
        ];
      case 'teacher':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher' },
          { text: 'Availability', icon: <AccessTimeIcon />, path: '/teacher/availability' },
          { text: 'Supervision Schedule', icon: <EventIcon />, path: '/teacher/supervision' },
        ];
      case 'student':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
          { text: 'Exam Schedule', icon: <EventIcon />, path: '/student/exams' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isDrawerExpanded ? 'space-between' : 'center',
          py: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SchoolIcon sx={{ mr: isDrawerExpanded ? 1 : 0, color: 'primary.main', fontSize: 28 }} />
          </motion.div>
          {isDrawerExpanded && (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2563eb 30%, #60a5fa 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ExamManager
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={toggleDrawerExpanded}
          sx={{
            display: { xs: 'none', sm: 'flex' },
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
      <Divider />
      <List>
        {menuItems().map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem disablePadding>
                <Tooltip title={!isDrawerExpanded ? item.text : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive}
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: 48,
                      justifyContent: isDrawerExpanded ? 'initial' : 'center',
                      px: 2.5,
                      '&::before': isActive ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '25%',
                        width: '4px',
                        height: '50%',
                        backgroundColor: 'primary.main',
                        borderRadius: '0 2px 2px 0',
                      } : {}
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'primary.main' : 'inherit',
                        minWidth: 0,
                        mr: isDrawerExpanded ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {isDrawerExpanded && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 600 : 400,
                          noWrap: true,
                        }}
                        sx={{ opacity: isDrawerExpanded ? 1 : 0 }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </motion.div>
          );
        })}
      </List>
      <Divider />
      <List>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ListItem disablePadding>
            <Tooltip title={!isDrawerExpanded ? "Logout" : ""} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  justifyContent: isDrawerExpanded ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isDrawerExpanded ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                {isDrawerExpanded && (
                  <ListItemText
                    primary="Logout"
                    sx={{ opacity: isDrawerExpanded ? 1 : 0 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </motion.div>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh', position: 'relative' }}>
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
          width: '100%', // Fill the entire width
          borderRadius: 0, // Remove border radius
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            minHeight: '70px', // Increase the height of the toolbar
            px: { xs: 2, md: 4 } // Add horizontal padding instead of margin
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
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
                      bgcolor: user?.role === 'admin' ? '#fde68a' :
                              user?.role === 'teacher' ? '#bfdbfe' : '#bbf7d0',
                      color: user?.role === 'admin' ? '#b45309' :
                              user?.role === 'teacher' ? '#1e40af' : '#15803d',
                      mr: 1.5,
                      fontSize: '0.875rem',
                      border: '2px solid rgba(255, 255, 255, 0.7)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </Tooltip>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textTransform: 'capitalize',
                      opacity: 0.9,
                    }}
                  >
                    {user?.role}
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
          position: 'fixed',
          width: drawerWidth,
          flexShrink: 0,
          zIndex: (theme) => theme.zIndex.drawer,
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: expandedDrawerWidth, // Always use expanded width for mobile
              boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.12)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: 'none',
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component={motion.main}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
          marginTop: '70px',
          borderRadius: { xs: '0', sm: '2rem 0 0 0' },
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 70px)',
          position: 'relative',
          overflow: 'hidden',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        <BackgroundPattern />
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Box>
    </Box>
  );
};

export default MainLayout;
