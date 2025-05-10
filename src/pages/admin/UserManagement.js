// src/pages/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
  FormHelperText,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  AdminPanelSettings as AdminIcon,
  LocalHospital as DoctorIcon,
  AssignmentInd as StaffIcon,
  SupervisorAccount as SupervisorIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ContactMail as ContactIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useApi } from '../../hooks/useApi';

// Mock user management service - replace with actual service when available
const userManagementService = {
  getAllUsers: async (params) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredUsers = mockUsers.filter(user => {
          // Apply search term filter
          if (params.search && !user.name.toLowerCase().includes(params.search.toLowerCase()) &&
              !user.email.toLowerCase().includes(params.search.toLowerCase()) &&
              !user.username.toLowerCase().includes(params.search.toLowerCase())) {
            return false;
          }
          
          // Apply role filter
          if (params.role && user.role !== params.role) {
            return false;
          }
          
          // Apply status filter
          if (params.status === 'active' && !user.isActive) {
            return false;
          }
          if (params.status === 'inactive' && user.isActive) {
            return false;
          }
          
          // Apply facility filter
          if (params.facility && user.facility !== params.facility) {
            return false;
          }
          
          return true;
        });
        
        // Apply pagination
        const page = params.page || 0;
        const pageSize = params.pageSize || 10;
        const startIndex = page * pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
        
        resolve({
          data: paginatedUsers,
          total: filteredUsers.length
        });
      }, 500);
    });
  },
  getUserById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not found'));
        }
      }, 300);
    });
  },
  createUser: async (userData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          ...userData,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };
        mockUsers.push(newUser);
        resolve(newUser);
      }, 700);
    });
  },
  updateUser: async (id, userData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          mockUsers[index] = {
            ...mockUsers[index],
            ...userData
          };
          resolve(mockUsers[index]);
        } else {
          reject(new Error('User not found'));
        }
      }, 700);
    });
  },
  deleteUser: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          mockUsers.splice(index, 1);
        }
        resolve({ success: true });
      }, 500);
    });
  },
  toggleUserStatus: async (id, isActive) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          mockUsers[index].isActive = isActive;
          resolve(mockUsers[index]);
        } else {
          reject(new Error('User not found'));
        }
      }, 500);
    });
  },
  resetPassword: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Password reset email sent successfully.' 
        });
      }, 500);
    });
  },
  exportUsers: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

// Mock user roles
const userRoles = [
  { id: 'admin', name: 'Administrator', icon: <AdminIcon color="error" /> },
  { id: 'supervisor', name: 'Supervisor', icon: <SupervisorIcon color="warning" /> },
  { id: 'doctor', name: 'Doctor', icon: <DoctorIcon color="primary" /> },
  { id: 'staff', name: 'Staff', icon: <StaffIcon color="info" /> }
];

// Mock facilities
const facilities = [
  'Uyo General Hospital',
  'Ikot Ekpene Health Center',
  'Eket General Hospital',
  'Oron Primary Health Center',
  'Abak Health Center',
  'Ministry of Health HQ',
  'Central Admin Office'
];

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    username: 'admin',
    email: 'admin@akwaibomhealth.gov.ng',
    role: 'admin',
    facility: 'Ministry of Health HQ',
    isActive: true,
    phone: '+234-701-234-5678',
    createdAt: '2023-01-15T10:30:00Z',
    lastLogin: '2023-06-01T08:45:30Z'
  },
  {
    id: 2,
    name: 'Dr. John Smith',
    username: 'jsmith',
    email: 'john.smith@akwaibomhealth.gov.ng',
    role: 'doctor',
    facility: 'Uyo General Hospital',
    isActive: true,
    phone: '+234-802-345-6789',
    createdAt: '2023-01-20T11:30:00Z',
    lastLogin: '2023-06-02T09:15:30Z'
  },
  {
    id: 3,
    name: 'Mary Johnson',
    username: 'mjohnson',
    email: 'mary.johnson@akwaibomhealth.gov.ng',
    role: 'staff',
    facility: 'Uyo General Hospital',
    isActive: true,
    phone: '+234-803-456-7890',
    createdAt: '2023-01-25T12:30:00Z',
    lastLogin: '2023-05-30T10:45:30Z'
  },
  {
    id: 4,
    name: 'David Williams',
    username: 'dwilliams',
    email: 'david.williams@akwaibomhealth.gov.ng',
    role: 'supervisor',
    facility: 'Ministry of Health HQ',
    isActive: true,
    phone: '+234-704-567-8901',
    createdAt: '2023-02-01T13:30:00Z',
    lastLogin: '2023-06-01T11:30:30Z'
  },
  {
    id: 5,
    name: 'Dr. Sarah Brown',
    username: 'sbrown',
    email: 'sarah.brown@akwaibomhealth.gov.ng',
    role: 'doctor',
    facility: 'Eket General Hospital',
    isActive: false,
    phone: '+234-805-678-9012',
    createdAt: '2023-02-05T14:30:00Z',
    lastLogin: '2023-05-15T12:15:30Z'
  },
  {
    id: 6,
    name: 'Michael Davis',
    username: 'mdavis',
    email: 'michael.davis@akwaibomhealth.gov.ng',
    role: 'staff',
    facility: 'Ikot Ekpene Health Center',
    isActive: true,
    phone: '+234-706-789-0123',
    createdAt: '2023-02-10T15:30:00Z',
    lastLogin: '2023-06-02T13:00:30Z'
  },
  {
    id: 7,
    name: 'Jennifer Wilson',
    username: 'jwilson',
    email: 'jennifer.wilson@akwaibomhealth.gov.ng',
    role: 'supervisor',
    facility: 'Oron Primary Health Center',
    isActive: true,
    phone: '+234-807-890-1234',
    createdAt: '2023-02-15T16:30:00Z',
    lastLogin: '2023-06-01T14:45:30Z'
  },
  {
    id: 8,
    name: 'Robert Taylor',
    username: 'rtaylor',
    email: 'robert.taylor@akwaibomhealth.gov.ng',
    role: 'staff',
    facility: 'Abak Health Center',
    isActive: false,
    phone: '+234-708-901-2345',
    createdAt: '2023-02-20T17:30:00Z',
    lastLogin: '2023-04-30T15:30:30Z'
  },
  {
    id: 9,
    name: 'Dr. Elizabeth Moore',
    username: 'emoore',
    email: 'elizabeth.moore@akwaibomhealth.gov.ng',
    role: 'doctor',
    facility: 'Uyo General Hospital',
    isActive: true,
    phone: '+234-809-012-3456',
    createdAt: '2023-02-25T18:30:00Z',
    lastLogin: '2023-06-02T16:15:30Z'
  },
  {
    id: 10,
    name: 'William Anderson',
    username: 'wanderson',
    email: 'william.anderson@akwaibomhealth.gov.ng',
    role: 'staff',
    facility: 'Central Admin Office',
    isActive: true,
    phone: '+234-810-123-4567',
    createdAt: '2023-03-01T19:30:00Z',
    lastLogin: '2023-06-01T17:00:30Z'
  },
  {
    id: 11,
    name: 'Dr. Patricia Thomas',
    username: 'pthomas',
    email: 'patricia.thomas@akwaibomhealth.gov.ng',
    role: 'doctor',
    facility: 'Ikot Ekpene Health Center',
    isActive: true,
    phone: '+234-811-234-5678',
    createdAt: '2023-03-05T20:30:00Z',
    lastLogin: '2023-06-02T18:30:30Z'
  },
  {
    id: 12,
    name: 'Charles Jackson',
    username: 'cjackson',
    email: 'charles.jackson@akwaibomhealth.gov.ng',
    role: 'supervisor',
    facility: 'Eket General Hospital',
    isActive: true,
    phone: '+234-812-345-6789',
    createdAt: '2023-03-10T21:30:00Z',
    lastLogin: '2023-06-01T19:15:30Z'
  }
];

// User Management Component
const UserManagement = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();

  // State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    facility: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState('create'); // 'create' or 'edit'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    facility: '',
    phone: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch users
  const fetchUsers = async () => {
    const queryParams = {
      page,
      pageSize,
      search: searchTerm,
      ...filters
    };

    await execute(
      userManagementService.getAllUsers,
      [queryParams],
      (response) => {
        setUsers(response.data);
        setTotalUsers(response.total);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  // Apply search and filters
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  // Handle search term change
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    if (searchTerm) {
      setPage(0);
      setTimeout(fetchUsers, 0);
    }
  };

  // Handle filter menu open
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPage(0);
    fetchUsers();
    handleFilterClose();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      role: '',
      status: '',
      facility: ''
    });
    setPage(0);
    // Don't close the menu here, let user see filters were reset
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open create user dialog
  const handleCreateUser = () => {
    setUserFormData({
      name: '',
      username: '',
      email: '',
      role: '',
      facility: '',
      phone: '',
      isActive: true
    });
    setFormErrors({});
    setUserDialogMode('create');
    setUserDialogOpen(true);
  };

  // Open edit user dialog
  const handleEditUser = async (userId) => {
    try {
      const user = await userManagementService.getUserById(userId);
      setUserFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        facility: user.facility,
        phone: user.phone,
        isActive: user.isActive
      });
      setSelectedUser(user);
      setFormErrors({});
      setUserDialogMode('edit');
      setUserDialogOpen(true);
      if (menuAnchorEl) {
        setMenuAnchorEl(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Handle user form input change
  const handleUserFormChange = (event) => {
    const { name, value, checked } = event.target;
    setUserFormData({
      ...userFormData,
      [name]: name === 'isActive' ? checked : value
    });
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate user form
  const validateUserForm = () => {
    const errors = {};
    if (!userFormData.name) errors.name = 'Name is required';
    if (!userFormData.username) errors.username = 'Username is required';
    if (!userFormData.email) errors.email = 'Email is required';
    if (!userFormData.email.includes('@')) errors.email = 'Invalid email address';
    if (!userFormData.role) errors.role = 'Role is required';
    if (!userFormData.facility) errors.facility = 'Facility is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit user form
  const handleUserFormSubmit = async () => {
    if (!validateUserForm()) return;
    
    try {
      if (userDialogMode === 'create') {
        await execute(
          userManagementService.createUser,
          [userFormData],
          (response) => {
            setActionSuccess('User created successfully');
            setTimeout(() => setActionSuccess(''), 5000);
            setUserDialogOpen(false);
            fetchUsers();
          }
        );
      } else {
        await execute(
          userManagementService.updateUser,
          [selectedUser.id, userFormData],
          (response) => {
            setActionSuccess('User updated successfully');
            setTimeout(() => setActionSuccess(''), 5000);
            setUserDialogOpen(false);
            fetchUsers();
          }
        );
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Open delete user dialog
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }
  };

  // Handle delete user
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await execute(
        userManagementService.deleteUser,
        [selectedUser.id],
        () => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
          setActionSuccess('User deleted successfully');
          setTimeout(() => setActionSuccess(''), 5000);
          fetchUsers();
        }
      );
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId, currentStatus) => {
    await execute(
      userManagementService.toggleUserStatus,
      [userId, !currentStatus],
      () => {
        setActionSuccess(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        setTimeout(() => setActionSuccess(''), 5000);
        fetchUsers();
        if (menuAnchorEl) {
          setMenuAnchorEl(null);
        }
      }
    );
  };

  // Open reset password dialog
  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }
  };

  // Handle reset password
  const handleResetPasswordConfirm = async () => {
    if (selectedUser) {
      await execute(
        userManagementService.resetPassword,
        [selectedUser.id],
        (response) => {
          setResetPasswordDialogOpen(false);
          setSelectedUser(null);
          setActionSuccess(response.message);
          setTimeout(() => setActionSuccess(''), 5000);
        }
      );
    }
  };

  // Handle export users
  const handleExportUsers = async () => {
    await execute(
      userManagementService.exportUsers,
      [],
      () => {
        setActionSuccess('Users exported successfully. Download should start automatically.');
        setTimeout(() => setActionSuccess(''), 5000);
      }
    );
  };

  // Action menu
  const handleMenuOpen = (event, userId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedUserId(null);
  };

  // Get role display
  const getRoleDisplay = (roleId) => {
    const role = userRoles.find(r => r.id === roleId);
    if (!role) return roleId;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {role.icon}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {role.name}
        </Typography>
      </Box>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportUsers}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        </Box>
      </Box>
      
      {actionSuccess && (
        <Alert 
          severity="success" 
          onClose={() => setActionSuccess('')}
          sx={{ mb: 2 }}
        >
          {actionSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          onClose={() => execute(null)}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexGrow: 1 }}>
          <TextField
            placeholder="Search users by name, email or username..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchTermChange}
            sx={{ maxWidth: 500 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ ml: 1 }}
          >
            Search
          </Button>
        </form>
        
        <Box sx={{ display: 'flex', ml: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            color={Object.values(filters).some(v => v !== '') ? "primary" : "inherit"}
          >
            Filter
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ ml: 1 }}
          >
            Refresh
          </Button>
        </Box>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{
            style: {
              width: 280,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter Users
            </Typography>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {userRoles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {role.icon}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {role.name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="facility-label">Facility</InputLabel>
              <Select
                labelId="facility-label"
                name="facility"
                value={filters.facility}
                onChange={handleFilterChange}
                label="Facility"
              >
                <MenuItem value="">All Facilities</MenuItem>
                {facilities.map((facility) => (
                  <MenuItem key={facility} value={facility}>{facility}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleResetFilters} size="small">
                Reset Filters
              </Button>
              <Button 
                onClick={handleApplyFilters} 
                variant="contained" 
                size="small" 
                sx={{ ml: 1 }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Menu>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleDisplay(user.role)}</TableCell>
                    <TableCell>{user.facility}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            color={user.isActive ? 'default' : 'primary'}
                          >
                            {user.isActive ? (
                              <LockIcon fontSize="small" />
                            ) : (
                              <LockOpenIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
          
          {users.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            </Box>
          )}
        </>
      )}
      
      {/* User Dialog - Create/Edit */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {userDialogMode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={userFormData.name}
                onChange={handleUserFormChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={userFormData.username}
                onChange={handleUserFormChange}
                error={Boolean(formErrors.username)}
                helperText={formErrors.username}
                required
                disabled={userDialogMode === 'edit'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={userFormData.phone}
                onChange={handleUserFormChange}
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={Boolean(formErrors.role)}
                required
              >
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role"
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserFormChange}
                  label="Role"
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {role.icon}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {role.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.role && (
                  <FormHelperText>{formErrors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={Boolean(formErrors.facility)}
                required
              >
                <InputLabel id="facility-select-label">Facility</InputLabel>
                <Select
                  labelId="facility-select-label"
                  id="facility"
                  name="facility"
                  value={userFormData.facility}
                  onChange={handleUserFormChange}
                  label="Facility"
                >
                  {facilities.map((facility) => (
                    <MenuItem key={facility} value={facility}>{facility}</MenuItem>
                  ))}
                </Select>
                {formErrors.facility && (
                  <FormHelperText>{formErrors.facility}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userFormData.isActive}
                    onChange={handleUserFormChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
            {userDialogMode === 'create' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  A temporary password will be generated and sent to the user's email address.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUserFormSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              userDialogMode === 'create' ? 'Create' : 'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the password for <strong>{selectedUser?.name}</strong>? 
            A new temporary password will be sent to their email address at <strong>{selectedUser?.email}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPasswordConfirm} color="primary" autoFocus>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedUserId && (
          <>
            <MenuItem onClick={() => handleEditUser(selectedUserId)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={() => {
              const user = users.find(u => u.id === selectedUserId);
              handleToggleStatus(selectedUserId, user.isActive);
            }}>
              <ListItemIcon>
                {users.find(u => u.id === selectedUserId)?.isActive ? (
                  <LockIcon fontSize="small" />
                ) : (
                  <LockOpenIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={users.find(u => u.id === selectedUserId)?.isActive ? 
                  "Deactivate" : "Activate"} 
              />
            </MenuItem>
            <MenuItem onClick={() => handleResetPasswordClick(users.find(u => u.id === selectedUserId))}>
              <ListItemIcon>
                <ContactIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Reset Password" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleDeleteClick(users.find(u => u.id === selectedUserId))}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  );
};

export default UserManagement;