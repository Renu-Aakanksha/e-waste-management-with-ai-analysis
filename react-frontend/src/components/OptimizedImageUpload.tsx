import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography
} from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

interface OptimizedImageUploadProps {
  onImageUpload: (file: File) => Promise<void>;
  onImageValidated: (isValid: boolean, classification?: any) => void;
  imageValidated: boolean;
  imageClassification: any;
  loading: boolean;
}

const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = memo(({
  onImageUpload,
  onImageValidated,
  imageValidated,
  imageClassification,
  loading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onImageValidated(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onImageValidated(false);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      onImageValidated(false);
    }
  }, [onImageUpload, onImageValidated]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    onImageValidated(false);
  }, [onImageValidated]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={dragActive ? 8 : 2}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'primary.50' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Analyzing image with AI...
            </Typography>
          </Box>
        ) : preview ? (
          <Box sx={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Upload preview"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              startIcon={<DeleteIcon />}
              color="error"
              size="small"
              sx={{ mt: 1 }}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload E-Waste Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Take a photo of your electronic device for AI validation
            </Typography>
            <Button variant="contained" component="span">
              Choose File
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Drag and drop or click to select
            </Typography>
          </Box>
        )}
      </Paper>

      {imageValidated && imageClassification && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Device detected as {imageClassification.device_type} using enhanced analysis. Please verify the category.
          </Alert>
          
          <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              AI Analysis Results:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                {imageClassification.device_count} device(s) detected
              </Typography>
              <Typography variant="body2" color="info.main" sx={{ fontWeight: 'bold' }}>
                {Math.round((imageClassification.confidence || 0) * 100)}% confidence
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Detected: electronic device
            </Typography>
            
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
              Device Type: {imageClassification.device_type?.toUpperCase()}
            </Typography>
            
            {imageClassification.device_model && imageClassification.device_model !== "Unknown Device" && (
              <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                Model: {imageClassification.device_model}
              </Typography>
            )}
            
            {imageClassification.device_model && imageClassification.device_model !== "Unknown Device" && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="caption" color="info.contrastText">
                  💡 This device model will be automatically saved with your booking
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
});

OptimizedImageUpload.displayName = 'OptimizedImageUpload';

export default OptimizedImageUpload;

