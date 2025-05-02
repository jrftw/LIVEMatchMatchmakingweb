import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      py: 1, 
      px: 2, 
      bgcolor: 'background.paper',
      borderTop: 1,
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <Typography variant="body2" color="text.secondary" align="center">
        © 2025 LiveMatchScheduling. All rights reserved.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Version 1.0.0
      </Typography>
    </Box>
  );
}

export default Footer; 