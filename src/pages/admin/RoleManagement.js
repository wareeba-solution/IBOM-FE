// src/pages/admin/RoleManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
  Divider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Shield as ShieldIcon,
  SupervisorAccount as SupervisorIcon,
  LocalHospital as DoctorIcon,
  AssignmentInd as StaffIcon,
  AdminPanelSettings as AdminIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';

// Mock role management service - replace with actual service when available
const roleManagementService = {
  getAllRoles: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockRoles,
          total: mockRoles.length
        });
      }, 500);
    });
  },
  getRoleById: async (id) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const role = mockRoles.find(r => r.id === id);
        if (role) {
          resolve(role);
        } else {
          reject(new Error('Role not found'));
        }
      }, 300);
    });
  },
  createRole: async (roleData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole = {
          id: Math.max(...mockRoles.map(r => r.id)) + 1,
          ...roleData,
          createdAt: new Date().toISOString()
        };
        mockRoles.push(newRole);
        resolve(newRole);
      }, 700);
    });
  },
  updateRole: async (id, roleData) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
          mockRoles[index] = {
            ...mockRoles[index],
            ...roleData
          };
          resolve(mockRoles[index]);
        } else {
          reject(new Error('Role not found'));
        }
      }, 700);
    });
  },
  deleteRole: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
          mockRoles.splice(index, 1);
        }
        resolve({ success: true });
      }, 500);
    });
  },
  getPermissions: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockPermissions
        });
      }, 300);
    });
  }
};

// Mock data
const mockRoles = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    code: 'admin',
    isSystemRole: true,
    usersCount: 3,
    permissions: ['all'],
    createdAt: '2023-01-10T10:00:00Z'
  },
  {
    id: 2,
    name: 'Supervisor',
    description: 'Manage and oversee staff and operations',
    code: 'supervisor',
    isSystemRole: true,
    usersCount: 8,
    permissions: [
      'dashboard.view',
      'patients.view', 'patients.create', 'patients.edit',
      'births.view', 'births.create', 'births.edit',
      'deaths.view', 'deaths.create', 'deaths.edit',
      'immunization.view', 'immunization.create', 'immunization.edit',
      'antenatal.view', 'antenatal.create', 'antenatal.edit',
      'diseases.view', 'diseases.create', 'diseases.edit',
      'familyPlanning.view', 'familyPlanning.create', 'familyPlanning.edit',
      'facilities.view',
      'reports.view', 'reports.create', 'reports.export',
      'users.view'
    ],
    createdAt: '2023-01-15T11:00:00Z'
  },
  {
    id: 3,
    name: 'Doctor',
    description: 'Medical practitioner with patient management access',
    code: 'doctor',
    isSystemRole: true,
    usersCount: 12,
    permissions: [
      'dashboard.view',
      'patients.view', 'patients.create', 'patients.edit',
      'births.view', 'births.create', 'births.edit',
      'deaths.view', 'deaths.create', 'deaths.edit',
      'immunization.view', 'immunization.create', 'immunization.edit',
      'antenatal.view', 'antenatal.create', 'antenatal.edit',
      'diseases.view', 'diseases.create', 'diseases.edit',
      'familyPlanning.view', 'familyPlanning.create', 'familyPlanning.edit',
      'reports.view'
    ],
    createdAt: '2023-01-20T12:00:00Z'
  },
  {
    id: 4,
    name: 'Staff',
    description: 'General staff with basic data entry access',
    code: 'staff',
    isSystemRole: true,
    usersCount: 25,
    permissions: [
      'dashboard.view',
      'patients.view', 'patients.create',
      'births.view', 'births.create',
      'deaths.view', 'deaths.create',
      'immunization.view', 'immunization.create',
      'antenatal.view', 'antenatal.create',
      'diseases.view', 'diseases.create',
      'familyPlanning.view', 'familyPlanning.create'
    ],
    createdAt: '2023-01-25T13:00:00Z'
  },
  {
    id: 5,
    name: 'Reports Analyst',
    description: 'Access to reporting and data analysis features',
    code: 'analyst',
    isSystemRole: false,
    usersCount: 5,
    permissions: [
      'dashboard.view',
      'patients.view',
      'births.view',
      'deaths.view',
      'immunization.view',
      'antenatal.view',
      'diseases.view',
      'familyPlanning.view',
      'reports.view', 'reports.create', 'reports.export'
    ],
    createdAt: '2023-02-10T14:00:00Z'
  },
  {
    id: 6,
    name: 'Records Officer',
    description: 'Focused on birth and death record management',
    code: 'records',
    isSystemRole: false,
    usersCount: 8,
    permissions: [
      'dashboard.view',
      'patients.view', 'patients.create',
      'births.view', 'births.create', 'births.edit', 'births.delete',
      'deaths.view', 'deaths.create', 'deaths.edit', 'deaths.delete',
      'reports.view'
    ],
    createdAt: '2023-02-15T15:00:00Z'
  }
];

// Mock permissions grouped by module
const mockPermissions = [
  {
    module: 'Dashboard',
    code: 'dashboard',
    permissions: [
      { code: 'dashboard.view', name: 'View Dashboard' }
    ]
  },
  {
    module: 'Patients',
    code: 'patients',
    permissions: [
      { code: 'patients.view', name: 'View Patients' },
      { code: 'patients.create', name: 'Create Patients' },
      { code: 'patients.edit', name: 'Edit Patients' },
      { code: 'patients.delete', name: 'Delete Patients' }
    ]
  },
  {
    module: 'Birth Records',
    code: 'births',
    permissions: [
      { code: 'births.view', name: 'View Birth Records' },
      { code: 'births.create', name: 'Create Birth Records' },
      { code: 'births.edit', name: 'Edit Birth Records' },
      { code: 'births.delete', name: 'Delete Birth Records' }
    ]
  },
  {
    module: 'Death Records',
    code: 'deaths',
    permissions: [
      { code: 'deaths.view', name: 'View Death Records' },
      { code: 'deaths.create', name: 'Create Death Records' },
      { code: 'deaths.edit', name: 'Edit Death Records' },
      { code: 'deaths.delete', name: 'Delete Death Records' }
    ]
  },
  {
    module: 'Immunization',
    code: 'immunization',
    permissions: [
      { code: 'immunization.view', name: 'View Immunization Records' },
      { code: 'immunization.create', name: 'Create Immunization Records' },
      { code: 'immunization.edit', name: 'Edit Immunization Records' },
      { code: 'immunization.delete', name: 'Delete Immunization Records' }
    ]
  },
  {
    module: 'Antenatal Care',
    code: 'antenatal',
    permissions: [
      { code: 'antenatal.view', name: 'View Antenatal Records' },
      { code: 'antenatal.create', name: 'Create Antenatal Records' },
      { code: 'antenatal.edit', name: 'Edit Antenatal Records' },
      { code: 'antenatal.delete', name: 'Delete Antenatal Records' }
    ]
  },
  {
    module: 'Communicable Diseases',
    code: 'diseases',
    permissions: [
      { code: 'diseases.view', name: 'View Disease Records' },
      { code: 'diseases.create', name: 'Create Disease Records' },
      { code: 'diseases.edit', name: 'Edit Disease Records' },
      { code: 'diseases.delete', name: 'Delete Disease Records' }
    ]
  },
  {
    module: 'Family Planning',
    code: 'familyPlanning',
    permissions: [
      { code: 'familyPlanning.view', name: 'View Family Planning Records' },
      { code: 'familyPlanning.create', name: 'Create Family Planning Records' },
      { code: 'familyPlanning.edit', name: 'Edit Family Planning Records' },
      { code: 'familyPlanning.delete', name: 'Delete Family Planning Records' }
    ]
  },
  {
    module: 'Facilities',
    code: 'facilities',
    permissions: [
      { code: 'facilities.view', name: 'View Facilities' },
      { code: 'facilities.create', name: 'Create Facilities' },
      { code: 'facilities.edit', name: 'Edit Facilities' },
      { code: 'facilities.delete', name: 'Delete Facilities' }
    ]
  },
  {
    module: 'Reports',
    code: 'reports',
    permissions: [
      { code: 'reports.view', name: 'View Reports' },
      { code: 'reports.create', name: 'Create Reports' },
      { code: 'reports.export', name: 'Export Reports' }
    ]
  },
  {
    module: 'Users & Roles',
    code: 'users',
    permissions: [
      { code: 'users.view', name: 'View Users' },
      { code: 'users.create', name: 'Create Users' },
      { code: 'users.edit', name: 'Edit Users' },
      { code: 'users.delete', name: 'Delete Users' },
      { code: 'roles.view', name: 'View Roles' },
      { code: 'roles.create', name: 'Create Roles' },
      { code: 'roles.edit', name: 'Edit Roles' },
      { code: 'roles.delete', name: 'Delete Roles' }
    ]
  },
  {
    module: 'System Settings',
    code: 'settings',
    permissions: [
      { code: 'settings.view', name: 'View Settings' },
      { code: 'settings.edit', name: 'Edit Settings' }
    ]
  },
  {
    module: 'Audit Logs',
    code: 'audit',
    permissions: [
      { code: 'audit.view', name: 'View Audit Logs' }
    ]
  }
];

// Role Icons mapping
const roleIcons = {
  'admin': <AdminIcon color="error" />,
  'supervisor': <SupervisorIcon color="warning" />,
  'doctor': <DoctorIcon color="primary" />,
  'staff': <StaffIcon color="info" />,
  'default': <ShieldIcon color="action" />
};

// Role Management Component
const RoleManagement = () => {
  const { loading, error, execute } = useApi();

  // State
  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogMode, setRoleDialogMode] = useState('create'); // 'create' or 'edit'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    code: '',
    permissions: []
  });
  const [permissionsData, setPermissionsData] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Fetch roles
  const fetchRoles = async () => {
    await execute(
      roleManagementService.getAllRoles,
      [],
      (response) => {
        setRoles(response.data);
        setTotalRoles(response.total);
      }
    );
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    await execute(
      roleManagementService.getPermissions,
      [],
      (response) => {
        setPermissionsData(response.data);
      }
    );
  };

  // Initial data loading
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open create role dialog
  const handleCreateRole = () => {
    setRoleFormData({
      name: '',
      description: '',
      code: '',
      permissions: []
    });
    setFormErrors({});
    setRoleDialogMode('create');
    setRoleDialogOpen(true);
  };

  // Open edit role dialog
  const handleEditRole = async (roleId) => {
    try {
      const role = await roleManagementService.getRoleById(roleId);
      setRoleFormData({
        name: role.name,
        description: role.description,
        code: role.code,
        permissions: role.permissions || []
      });
      setSelectedRole(role);
      setFormErrors({});
      setRoleDialogMode('edit');
      setRoleDialogOpen(true);
      if (menuAnchorEl) {
        setMenuAnchorEl(null);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  // Handle role form input change
  const handleRoleFormChange = (event) => {
    const { name, value } = event.target;
    setRoleFormData({
      ...roleFormData,
      [name]: value
    });
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle permission checkbox change
  const handlePermissionChange = (permissionCode) => {
    const updatedPermissions = [...roleFormData.permissions];
    
    if (permissionCode === 'all') {
      // If "All Permissions" is clicked
      if (updatedPermissions.includes('all')) {
        // If already had all permissions, remove 'all'
        const index = updatedPermissions.indexOf('all');
        updatedPermissions.splice(index, 1);
      } else {
        // Add 'all' permission and clear others
        return setRoleFormData({
          ...roleFormData,
          permissions: ['all']
        });
      }
    } else {
      // Remove 'all' permission if any specific permission is changed
      if (updatedPermissions.includes('all')) {
        const allIndex = updatedPermissions.indexOf('all');
        updatedPermissions.splice(allIndex, 1);
        
        // Add all individual permissions except the one being toggled
        permissionsData.forEach(module => {
          module.permissions.forEach(permission => {
            if (permission.code !== permissionCode && !updatedPermissions.includes(permission.code)) {
              updatedPermissions.push(permission.code);
            }
          });
        });
      }
      
      // Toggle the specific permission
      const index = updatedPermissions.indexOf(permissionCode);
      if (index > -1) {
        updatedPermissions.splice(index, 1);
      } else {
        updatedPermissions.push(permissionCode);
      }
    }
    
    setRoleFormData({
      ...roleFormData,
      permissions: updatedPermissions
    });
  };
  
  // Check if module has all permissions selected
  const isModuleFullySelected = (modulePermissions) => {
    if (roleFormData.permissions.includes('all')) return true;
    
    return modulePermissions.every(permission => 
      roleFormData.permissions.includes(permission.code)
    );
  };
  
  // Check if module has some permissions selected
  const isModulePartiallySelected = (modulePermissions) => {
    if (roleFormData.permissions.includes('all')) return false;
    
    const hasAny = modulePermissions.some(permission => 
      roleFormData.permissions.includes(permission.code)
    );
    
    const hasAll = modulePermissions.every(permission => 
      roleFormData.permissions.includes(permission.code)
    );
    
    return hasAny && !hasAll;
  };
  
  // Handle module checkbox (select/deselect all permissions in module)
  const handleModuleChange = (modulePermissions) => {
    const updatedPermissions = [...roleFormData.permissions];
    
    // Remove 'all' permission if any specific module is changed
    if (updatedPermissions.includes('all')) {
      const allIndex = updatedPermissions.indexOf('all');
      updatedPermissions.splice(allIndex, 1);
      
      // Add all individual permissions except those in the current module
      permissionsData.forEach(module => {
        module.permissions.forEach(permission => {
          if (!modulePermissions.some(p => p.code === permission.code) && 
              !updatedPermissions.includes(permission.code)) {
            updatedPermissions.push(permission.code);
          }
        });
      });
    }
    
    const isFullySelected = isModuleFullySelected(modulePermissions);
    
    if (isFullySelected) {
      // Remove all permissions from this module
      modulePermissions.forEach(permission => {
        const index = updatedPermissions.indexOf(permission.code);
        if (index > -1) {
          updatedPermissions.splice(index, 1);
        }
      });
    } else {
      // Add all permissions from this module
      modulePermissions.forEach(permission => {
        if (!updatedPermissions.includes(permission.code)) {
          updatedPermissions.push(permission.code);
        }
      });
    }
    
    setRoleFormData({
      ...roleFormData,
      permissions: updatedPermissions
    });
  };

  // Validate role form
  const validateRoleForm = () => {
    const errors = {};
    if (!roleFormData.name) errors.name = 'Name is required';
    if (!roleFormData.code) errors.code = 'Code is required';
    if (roleFormData.permissions.length === 0) errors.permissions = 'At least one permission must be selected';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate role code from name
  const generateRoleCode = () => {
    if (!roleFormData.name) return;
    
    const code = roleFormData.name.toLowerCase()
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, '') // Remove special characters
      .substring(0, 20);          // Limit length
    
    setRoleFormData({
      ...roleFormData,
      code
    });
  };

  // Submit role form
  const handleRoleFormSubmit = async () => {
    if (!validateRoleForm()) return;
    
    try {
      if (roleDialogMode === 'create') {
        await execute(
          roleManagementService.createRole,
          [roleFormData],
          (response) => {
            setActionSuccess('Role created successfully');
            setTimeout(() => setActionSuccess(''), 5000);
            setRoleDialogOpen(false);
            fetchRoles();
          }
        );
      } else {
        await execute(
          roleManagementService.updateRole,
          [selectedRole.id, roleFormData],
          (response) => {
            setActionSuccess('Role updated successfully');
            setTimeout(() => setActionSuccess(''), 5000);
            setRoleDialogOpen(false);
            fetchRoles();
          }
        );
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  // Open delete role dialog
  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
    if (menuAnchorEl) {
      setMenuAnchorEl(null);
    }
  };

  // Handle delete role
  const handleDeleteConfirm = async () => {
    if (selectedRole) {
      await execute(
        roleManagementService.deleteRole,
        [selectedRole.id],
        () => {
          setDeleteDialogOpen(false);
          setSelectedRole(null);
          setActionSuccess('Role deleted successfully');
          setTimeout(() => setActionSuccess(''), 5000);
          fetchRoles();
        }
      );
    }
  };

  // Action menu
  const handleMenuOpen = (event, roleId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRoleId(roleId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRoleId(null);
  };

  // Get role icon
  const getRoleIcon = (roleCode) => {
    return roleIcons[roleCode] || roleIcons.default;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Role Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
          >
            Add Role
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
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRoles}
        >
          Refresh
        </Button>
      </Box>
      
      {loading && !roles.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.slice(page * pageSize, page * pageSize + pageSize).map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getRoleIcon(role.code)}
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                          {role.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={role.code} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{role.usersCount}</TableCell>
                    <TableCell>
                      {role.isSystemRole ? (
                        <Chip 
                          label="System" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Custom" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(role.id)}
                            disabled={role.isSystemRole && role.code === 'admin'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, role.id)}
                          disabled={role.isSystemRole && role.code === 'admin'}
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
            count={totalRoles}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
          
          {roles.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No roles found.
              </Typography>
            </Box>
          )}
        </>
      )}
      
      {/* Role Dialog - Create/Edit */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {roleDialogMode === 'create' ? 'Create New Role' : 'Edit Role'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role Name"
                name="name"
                value={roleFormData.name}
                onChange={handleRoleFormChange}
                onBlur={generateRoleCode}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role Code"
                name="code"
                value={roleFormData.code}
                onChange={handleRoleFormChange}
                error={Boolean(formErrors.code)}
                helperText={formErrors.code}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={roleFormData.description}
                onChange={handleRoleFormChange}
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Permissions
              </Typography>
              {formErrors.permissions && (
                <FormHelperText error>{formErrors.permissions}</FormHelperText>
              )}
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={roleFormData.permissions.includes('all')}
                      onChange={() => handlePermissionChange('all')}
                      color="primary"
                    />
                  }
                  label={<Typography fontWeight="bold">All Permissions</Typography>}
                />
              </FormGroup>
              
              <Divider sx={{ my: 1 }} />
              
              {permissionsData.map((module) => (
                <Box key={module.code} sx={{ mb: 2 }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isModuleFullySelected(module.permissions)}
                          indeterminate={isModulePartiallySelected(module.permissions)}
                          onChange={() => handleModuleChange(module.permissions)}
                          color="primary"
                        />
                      }
                      label={<Typography fontWeight="medium">{module.module}</Typography>}
                    />
                    <Box sx={{ ml: 3 }}>
                      <Grid container spacing={1}>
                        {module.permissions.map((permission) => (
                          <Grid item xs={12} sm={6} md={4} key={permission.code}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={
                                    roleFormData.permissions.includes('all') || 
                                    roleFormData.permissions.includes(permission.code)
                                  }
                                  onChange={() => handlePermissionChange(permission.code)}
                                  color="primary"
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">{permission.name}</Typography>}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </FormGroup>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRoleFormSubmit} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              roleDialogMode === 'create' ? 'Create Role' : 'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Role Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? This will affect users assigned to this role and cannot be undone.
          </DialogContentText>
          {selectedRole?.usersCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This role is currently assigned to {selectedRole.usersCount} users. These users will need to be reassigned to different roles.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRoleId && (
          <>
            <MenuItem onClick={() => handleEditRole(selectedRoleId)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={() => handleDeleteClick(roles.find(r => r.id === selectedRoleId))}>
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

export default RoleManagement;