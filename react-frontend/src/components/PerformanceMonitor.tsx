import { Box, Chip, Paper, Typography } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({ 
  componentName, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    
    // Update metrics
    setMetrics(prev => {
      const renderTime = performance.now() - startTime;
      const newRenderCount = prev.renderCount + 1;
      const newAverageRenderTime = (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
      
      return {
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverageRenderTime,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };
    });
  });

  if (!enabled) return null;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1, 
        mb: 1, 
        bgcolor: 'warning.50',
        border: '1px solid',
        borderColor: 'warning.200'
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
        🚀 {componentName} Performance:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
        <Chip 
          label={`Renders: ${metrics.renderCount}`} 
          size="small" 
          color={metrics.renderCount > 10 ? 'error' : 'default'}
        />
        <Chip 
          label={`Last: ${metrics.lastRenderTime.toFixed(2)}ms`} 
          size="small"
          color={metrics.lastRenderTime > 16 ? 'warning' : 'success'}
        />
        <Chip 
          label={`Avg: ${metrics.averageRenderTime.toFixed(2)}ms`} 
          size="small"
          color={metrics.averageRenderTime > 16 ? 'warning' : 'success'}
        />
        {metrics.memoryUsage && (
          <Chip 
            label={`Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`} 
            size="small"
            color={metrics.memoryUsage > 50 * 1024 * 1024 ? 'error' : 'default'}
          />
        )}
      </Box>
    </Paper>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

