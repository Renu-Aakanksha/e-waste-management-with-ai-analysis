import {
    CheckCircle as CheckIcon,
    Delete as DeleteIcon,
    Error as ErrorIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Typography
} from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { aiAPI } from '../services/api';

interface ImageUploadProps {
  onImageValidated: (isValid: boolean, classification?: any) => void;
  disabled?: boolean;
}

interface ClassificationResult {
  is_electronic_waste: boolean;
  device_count: number;
  detected_devices: string[];
  device_type: string;
  device_model: string;
  confidence: number;
  message: string;
  user_message: string;
  error?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageValidated, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [disabled]);

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Please upload an image smaller than 10MB.');
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Auto-upload the file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setClassification(null);

    try {
      const response = await aiAPI.classifyImage(file);
      const result = response.data.classification as ClassificationResult;
      
      setClassification(result);
      onImageValidated(result.is_electronic_waste && result.device_count === 1, result);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to analyze image';
      setError(errorMessage);
      onImageValidated(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setClassification(null);
    setError(null);
    onImageValidated(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = () => {
    if (error) return 'error';
    if (classification?.is_electronic_waste && classification?.device_count === 1) return 'success';
    if (classification?.is_electronic_waste && classification?.device_count > 1) return 'warning';
    if (classification && !classification.is_electronic_waste) return 'error';
    return 'default';
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (classification?.user_message) return classification.user_message;
    return 'Upload an image of your electronic device';
  };

  const getStatusIcon = () => {
    if (error) return <ErrorIcon />;
    if (classification?.is_electronic_waste && classification?.device_count === 1) return <CheckIcon />;
    if (classification?.is_electronic_waste && classification?.device_count > 1) return <ErrorIcon />;
    if (classification && !classification.is_electronic_waste) return <ErrorIcon />;
    return <ImageIcon />;
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom align="center">
          Upload E-Waste Image
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Take a photo of your electronic device for AI validation
        </Typography>

        {/* Upload Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: `2px dashed ${
              dragActive ? 'primary.main' : 
              error ? 'error.main' : 
              classification?.is_electronic_waste && classification?.device_count === 1 ? 'success.main' :
              'grey.300'
            }`,
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease',
            '&:hover': disabled ? {} : {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          {isUploading ? (
            <Box>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Analyzing image with AI...
              </Typography>
            </Box>
          ) : previewUrl ? (
            <Box>
              <img
                src={previewUrl}
                alt="Uploaded preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <IconButton onClick={clearFile} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box>
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PNG, JPG, JPEG up to 10MB
              </Typography>
            </Box>
          )}
        </Box>

        {/* Status Message */}
        {getStatusMessage() && (
          <Alert 
            severity={getStatusColor() as any} 
            icon={getStatusIcon()}
            sx={{ mt: 2 }}
          >
            {getStatusMessage()}
          </Alert>
        )}

        {/* Classification Details */}
        {classification && !error && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              AI Analysis Results:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={`${classification.device_count} device(s) detected`}
                color={classification.device_count === 1 ? 'success' : 'warning'}
                size="small"
              />
              <Chip
                label={`${Math.round(classification.confidence * 100)}% confidence`}
                color="info"
                size="small"
              />
            </Box>

            {classification.detected_devices.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Detected: {classification.detected_devices.join(', ')}
              </Typography>
            )}
            
            {classification.device_type && (
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                Device Type: {classification.device_type.replace('_', ' ').toUpperCase()}
              </Typography>
            )}
            
            {classification.device_model && classification.device_model !== "Unknown Device" && (
              <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                Model: {classification.device_model}
              </Typography>
            )}
            
            {classification.device_model && classification.device_model !== "Unknown Device" && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="caption" color="info.contrastText">
                  💡 This device model will be automatically saved with your booking
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Instructions:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            • Upload a clear photo of ONE electronic device<br/>
            • Make sure the device is visible and well-lit<br/>
            • Only electronic devices (phones, laptops, etc.) are accepted<br/>
            • Upload one device at a time for best results
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;

