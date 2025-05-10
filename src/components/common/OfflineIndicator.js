// src/components/common/OfflineIndicator.js
import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { WifiOff as WifiOffIcon } from '@mui/icons-material';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Chip
      icon={<WifiOffIcon />}
      label="Offline"
      color="error"
      size="small"
      sx={{ mr: 1 }}
    />
  );
};

export default OfflineIndicator;