// src/pages/facilities/FacilityMap.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  LocalHospital as HospitalIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import MainLayout from '../../components/common/Layout/MainLayout';
import { useApi } from '../../hooks/useApi';

// Mock service for facility locations
const facilityMapService = {
  getFacilityLocations: async (filters) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock facility location data
        // Using coordinate ranges for Akwa Ibom State, Nigeria
        // Latitude: approximately 4.5 to 5.5 degrees North
        // Longitude: approximately 7.5 to 8.5 degrees East
        const facilities = Array.from({ length: 50 }, (_, i) => {
          const lat = 4.5 + Math.random() * 1.0; // 4.5 to 5.5
          const lng = 7.5 + Math.random() * 1.0; // 7.5 to 8.5
          
          // Determine type based on index
          let type, level, ownership;
          if (i % 3 === 0) {
            type = 'Hospital';
            level = i % 6 === 0 ? 'Tertiary' : 'Secondary';
          } else if (i % 3 === 1) {
            type = 'Primary Health Center';
            level = 'Primary';
          } else {
            type = 'Clinic';
            level = 'Primary';
          }
          
          // Determine ownership
          if (i % 4 === 0) ownership = 'Government';
          else if (i % 4 === 1) ownership = 'Private';
          else if (i % 4 === 2) ownership = 'Faith-based';
          else ownership = 'NGO';
          
          // Generate mock city/LGA
          const cities = ['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak', 'Etinan', 'Ibeno', 'Itu'];
          const city = cities[i % cities.length];
          
          return {
            id: i + 1,
            facility_code: `FAC${10000 + i}`,
            name: `${type === 'Hospital' ? 'General Hospital' : (type === 'Primary Health Center' ? 'PHC' : 'Medical Clinic')} ${i + 1}`,
            type,
            level,
            ownership,
            city,
            address: `${i + 1} Main Street, ${city}`,
            coordinate: { lat, lng },
            beds: type === 'Hospital' ? 50 + i % 30 : (type === 'Primary Health Center' ? 20 + i % 10 : 10 + i % 5),
            status: i % 10 === 0 ? 'Inactive' : 'Active'
          };
        });
        
        // Apply filters if provided
        let filteredFacilities = facilities;
        if (filters) {
          if (filters.type) {
            filteredFacilities = filteredFacilities.filter(f => f.type === filters.type);
          }
          if (filters.level) {
            filteredFacilities = filteredFacilities.filter(f => f.level === filters.level);
          }
          if (filters.ownership) {
            filteredFacilities = filteredFacilities.filter(f => f.ownership === filters.ownership);
          }
          if (filters.city) {
            filteredFacilities = filteredFacilities.filter(f => f.city === filters.city);
          }
          if (filters.status) {
            filteredFacilities = filteredFacilities.filter(f => f.status === filters.status);
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredFacilities = filteredFacilities.filter(f => 
              f.name.toLowerCase().includes(searchLower) || 
              f.facility_code.toLowerCase().includes(searchLower) ||
              f.address.toLowerCase().includes(searchLower)
            );
          }
        }
        
        resolve(filteredFacilities);
      }, 500);
    });
  }
};

const FacilityMap = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useApi();
  
  // State
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    ownership: '',
    city: '',
    status: ''
  });
  const [mapCenter, setMapCenter] = useState({ lat: 4.98, lng: 7.93 }); // Center of Akwa Ibom State
  const [mapZoom, setMapZoom] = useState(10);
  
  // Load facility locations
  useEffect(() => {
    fetchFacilities();
  }, [filters]);
  
  // Fetch facilities with applied filters
  const fetchFacilities = async () => {
    const appliedFilters = {
      ...filters,
      search: searchTerm
    };
    
    await execute(
      facilityMapService.getFacilityLocations,
      [appliedFilters],
      (response) => {
        setFacilities(response);
        // Reset selected facility if it's no longer in the list
        if (selectedFacility && !response.find(f => f.id === selectedFacility.id)) {
          setSelectedFacility(null);
        }
      }
    );
  };
  
  // Handle facility selection
  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    // Center map on selected facility
    setMapCenter(facility.coordinate);
    setMapZoom(14);
  };
  
  // Handle facility click for navigation to detail
  const handleFacilityDetail = (id) => {
    navigate(`/facilities/${id}`);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchFacilities();
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    fetchFacilities();
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      type: '',
      level: '',
      ownership: '',
      city: '',
      status: ''
    });
    setSearchTerm('');
  };
  
  // Use current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMapCenter(currentLocation);
          setMapZoom(13);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };
  
  // Navigate back
  const handleBack = () => {
    navigate('/facilities');
  };
  
  // Get marker color based on facility type
  const getMarkerColor = (type) => {
    switch (type) {
      case 'Hospital':
        return '#e53935'; // Red
      case 'Primary Health Center':
        return '#43a047'; // Green
      case 'Clinic':
        return '#1e88e5'; // Blue
      default:
        return '#9e9e9e'; // Grey
    }
  };
  
  // Get icon based on facility type
  const getFacilityIcon = (type) => {
    switch (type) {
      case 'Hospital':
        return <HospitalIcon sx={{ color: '#e53935' }} />;
      case 'Primary Health Center':
        return <HospitalIcon sx={{ color: '#43a047' }} />;
      case 'Clinic':
        return <HospitalIcon sx={{ color: '#1e88e5' }} />;
      default:
        return <HospitalIcon sx={{ color: '#9e9e9e' }} />;
    }
  };
  
  // Render Google Map
  const renderMap = () => {
    // In a real application, you would use a proper map library like Google Maps, Leaflet, or Mapbox
    // This is a placeholder to demonstrate the component structure
    return (
      <Box 
        sx={{ 
          height: 600, 
          bgcolor: '#e5e3df', 
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1, zIndex: 1 }}>
          <IconButton 
            color="primary" 
            sx={{ bgcolor: 'white', boxShadow: 1, mr: 1 }}
            onClick={handleUseCurrentLocation}
            title="Use Current Location"
          >
            <MyLocationIcon />
          </IconButton>
          <IconButton 
            color="primary" 
            sx={{ bgcolor: 'white', boxShadow: 1 }}
            onClick={() => {
              setMapCenter({ lat: 4.98, lng: 7.93 });
              setMapZoom(10);
            }}
            title="Reset View"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Map View - The actual map component would be integrated here
          </Typography>
          
          {/* Here's where you would render markers for facilities */}
          {/* This is a placeholder comment showing where map markers would be rendered */}
          
          {/* 
            facilities.map(facility => (
              <Marker
                key={facility.id}
                position={facility.coordinate}
                title={facility.name}
                onClick={() => handleFacilitySelect(facility)}
                icon={{
                  fillColor: getMarkerColor(facility.type),
                  selected: selectedFacility?.id === facility.id
                }}
              />
            ))
          */}
        </Box>
        
        {/* Legend */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16, 
            bgcolor: 'rgba(255,255,255,0.9)', 
            boxShadow: 1,
            borderRadius: 1,
            p: 1
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Legend
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e53935', mr: 1 }} />
              <Typography variant="body2">Hospital</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#43a047', mr: 1 }} />
              <Typography variant="body2">Primary Health Center</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1e88e5', mr: 1 }} />
              <Typography variant="body2">Clinic</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Render facility list
  const renderFacilityList = () => {
    return (
      <Box sx={{ height: 600, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Facilities 
          <Chip 
            label={`${facilities.length} found`} 
            size="small" 
            sx={{ ml: 1 }} 
          />
        </Typography>
        
        <List dense>
          {facilities.map((facility) => (
            <ListItem 
              key={facility.id}
              button 
              onClick={() => handleFacilitySelect(facility)}
              selected={selectedFacility?.id === facility.id}
              sx={{ 
                mb: 1, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: selectedFacility?.id === facility.id ? 'action.selected' : 'background.paper'
              }}
            >
              <ListItemIcon>
                {getFacilityIcon(facility.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" component="span">
                      {facility.name}
                    </Typography>
                    <Chip 
                      label={facility.status} 
                      color={facility.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <HospitalIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                      <Typography variant="body2" component="span">
                        {facility.type} ({facility.level})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                      <Typography variant="body2" component="span">
                        {facility.city}
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
          ))}
          
          {facilities.length === 0 && !loading && (
            <ListItem>
              <ListItemText
                primary="No facilities found"
                secondary="Try adjusting your filters or search term"
              />
            </ListItem>
          )}
        </List>
      </Box>
    );
  };
  
  // Render facility detail card
  const renderFacilityDetail = () => {
    if (!selectedFacility) return null;
    
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" gutterBottom>
              {selectedFacility.name}
            </Typography>
            <Chip 
              label={selectedFacility.status} 
              color={selectedFacility.status === 'Active' ? 'success' : 'default'} 
              size="small" 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedFacility.facility_code}
          </Typography>
          
          <Divider sx={{ my: 1.5 }} />
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <HospitalIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Facility Type" 
                secondary={`${selectedFacility.type} (${selectedFacility.level})`} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Address" 
                secondary={selectedFacility.address} 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MapIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Coordinates" 
                secondary={`${selectedFacility.coordinate.lat.toFixed(6)}, ${selectedFacility.coordinate.lng.toFixed(6)}`} 
              />
            </ListItem>
          </List>
          
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => handleFacilityDetail(selectedFacility.id)}
          >
            View Facility Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout
      title="Facilities Map"
      breadcrumbs={[
        { name: 'Facilities', path: '/facilities' },
        { name: 'Map View', active: true }
      ]}
    >
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Healthcare Facilities Map
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Filters and Search */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  placeholder="Search facilities..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearch}
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
              </form>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="type-label">Facility Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  label="Facility Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Primary Health Center">Primary Health Center</MenuItem>
                  <MenuItem value="Clinic">Clinic</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="level-label">Level</InputLabel>
                <Select
                  labelId="level-label"
                  id="level"
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Secondary">Secondary</MenuItem>
                  <MenuItem value="Tertiary">Tertiary</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="ownership-label">Ownership</InputLabel>
                <Select
                  labelId="ownership-label"
                  id="ownership"
                  name="ownership"
                  value={filters.ownership}
                  onChange={handleFilterChange}
                  label="Ownership"
                >
                  <MenuItem value="">All Ownerships</MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Faith-based">Faith-based</MenuItem>
                  <MenuItem value="NGO">NGO</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Box>
          </Grid>
          
          {/* Map and List */}
          <Grid item xs={12} md={8}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderMap()
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              {selectedFacility && renderFacilityDetail()}
              {renderFacilityList()}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </MainLayout>
  );
};

// Helper components
const Grid = ({ container, item, xs, md, spacing, children, sx }) => {
  let className = '';
  if (container) className += 'grid-container ';
  if (item) className += 'grid-item ';
  if (xs) className += `grid-xs-${xs} `;
  if (md) className += `grid-md-${md} `;
  
  return (
    <Box 
      className={className.trim()}
      sx={{
        ...(container && { 
          display: 'flex', 
          flexWrap: 'wrap',
          margin: spacing ? `-${spacing * 4}px` : 0
        }),
        ...(item && {
          padding: spacing ? `${spacing * 4}px` : 0
        }),
        ...(xs && {
          flexBasis: `${(xs / 12) * 100}%`,
          maxWidth: `${(xs / 12) * 100}%`
        }),
        ...(md && {
          '@media (min-width: 960px)': {
            flexBasis: `${(md / 12) * 100}%`,
            maxWidth: `${(md / 12) * 100}%`
          }
        }),
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default FacilityMap;