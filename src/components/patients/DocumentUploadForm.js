// src/components/patients/DocumentUploadForm.js
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useApi } from '../../hooks/useApi';

const DocumentUploadForm = ({ open, onClose, patientId, onSaved }) => {
  const { loading, error, execute } = useApi();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    document_type: '',
    document_date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    description: '',
    source: '',
    confidential: false
  });
  
  // Files state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Document type options
  const documentTypes = [
    'Medical Report',
    'Lab Result',
    'Imaging Result',
    'Prescription',
    'Discharge Summary',
    'Referral Letter',
    'Consent Form',
    'Insurance Document',
    'ID Document',
    'Other'
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (10MB max per file)
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      alert('Some files were not added because they exceed the 10MB size limit.');
    }
    
    // Add files to the list
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Clear the file input
    e.target.value = null;
  };

  // Handle file removal
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    const fileType = file.type.split('/')[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'image') {
      return <ImageIcon color="primary" />;
    } else if (fileExtension === 'pdf') {
      return <PdfIcon color="error" />;
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(fileExtension)) {
      return <DescriptionIcon color="primary" />;
    } else {
      return <FileIcon />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simulate upload progress
  const simulateUploadProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      
      // Call the submit handler after "upload" is complete
      completeSubmission();
    }, 3000);
  };

  // Complete the submission after files are "uploaded"
  const completeSubmission = () => {
    // Format the data for API
    const submissionData = {
      ...formData,
      files: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      }))
    };
    
    // In a real app, this would be an actual API call
    onSaved(submissionData);
    onClose();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }
    
    // Start the upload simulation
    simulateUploadProgress();
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="document-type-label">Document Type</InputLabel>
                <Select
                  labelId="document-type-label"
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  label="Document Type"
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Document Date"
                name="document_date"
                type="date"
                value={formData.document_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Lab Results from General Hospital"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Brief description of the document"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source / Issuing Authority"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Uyo General Hospital Lab Department"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Upload Files
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select files to upload. Maximum 10MB per file. Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT.
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)'
                  }
                }}
                onClick={handleBrowseClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Drag & Drop Files Here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Or click to browse files
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  sx={{ mt: 2 }}
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </Button>
              </Box>
              
              {selectedFiles.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2 }}>
                  <List dense>
                    {selectedFiles.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getFileIcon(file)}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={formatFileSize(file.size)}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              
              {isUploading && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploading files... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              )}
            </Grid>
          </Grid>
        </form>
        
        {error && (
          <Box sx={{ mt: 2, color: 'error.main' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || isUploading || !formData.document_type || !formData.title || selectedFiles.length === 0}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadForm;