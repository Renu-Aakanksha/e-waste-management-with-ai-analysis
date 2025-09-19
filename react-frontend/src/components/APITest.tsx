import { Alert, Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import { api } from '../services/api';

const APITest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>API Test</Typography>
      <Button variant="contained" onClick={testAPI} disabled={loading}>
        Test Login API
      </Button>
      {result && (
        <Alert severity={result.includes('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
        </Alert>
      )}
    </Box>
  );
};

export default APITest;
