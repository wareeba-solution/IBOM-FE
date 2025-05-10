// src/components/common/Layout/MainLayout.js
import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Menu, 
  MenuItem, 
  Avatar, 
  Breadcrumbs,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ChildCare as BirthIcon,
  SentimentVeryDissatisfied as DeathIcon,
  Healing as ImmunizationIcon,
  PregnantWoman as AntenatalIcon,
  Coronavirus as DiseaseIcon,
  FamilyRestroom as FamilyPlanningIcon,
  LocalHospital as FacilityIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ExitToApp as LogoutIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useThemeContext } from '../../../context/ThemeContext';
import OfflineIndicator from '../OfflineIndicator';

const drawerWidth = 240;

// Navigation items configuration
const mainNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/Dashboard' },
  { text: 'Patients', icon: <PersonIcon />, path: '/patients' },
  { text: 'Birth Records', icon: <BirthIcon />, path: '/births' },
  { text: 'Death Records', icon: <DeathIcon />, path: '/deaths' },
  { text: 'Immunization', icon: <ImmunizationIcon />, path: '/immunizations' },
  { text: 'Antenatal Care', icon: <AntenatalIcon />, path: '/antenatal' },
  { text: 'Diseases', icon: <DiseaseIcon />, path: '/diseases' },
  { text: 'Family Planning', icon: <FamilyPlanningIcon />, path: '/family-planning' },
  { text: 'Facilities', icon: <FacilityIcon />, path: '/facilities' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
];

const secondaryNavItems = [
  { text: 'Admin', icon: <AdminIcon />, path: '/admin', role: 'admin' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const MainLayout = ({ children, title, breadcrumbs = [] }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleTheme, mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/settings/profile');
  };

  // Generate breadcrumbs with proper paths
  const generateBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) {
      const pathnames = location.pathname.split('/').filter(x => x);
      if (pathnames.length === 0) return [];
      
      let breadcrumbsItems = [];
      let path = '';
      
      pathnames.forEach((name, index) => {
        path += `/${name}`;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        breadcrumbsItems.push({
          name: formattedName,
          path: index === pathnames.length - 1 ? null : path,
          active: index === pathnames.length - 1
        });
      });
      
      return [{ name: 'Home', path: '/dashboard' }, ...breadcrumbsItems];
    }
    
    return breadcrumbs;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Akwa Ibom Health
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {secondaryNavItems
          .filter(item => !item.role || (user && user.role === item.role))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={location.pathname.startsWith(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
        ))}
      </List>
    </div>
  );

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <OfflineIndicator />
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar 
              sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
              alt={user?.name || "User"}
              src={user?.avatar || ""}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        {breadcrumbItems.length > 0 && (
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
          >
            {breadcrumbItems.map((item, index) => {
              if (item.active) {
                return (
                  <Typography key={index} color="text.primary">
                    {item.name}
                  </Typography>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  style={{ 
                    textDecoration: 'none',
                    color: theme.palette.primary.main
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;