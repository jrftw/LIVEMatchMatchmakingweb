import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} LiveMatch. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Link href="/help" color="inherit" underline="hover">
              Help
            </Link>
            <Link href="/terms" color="inherit" underline="hover">
              Terms
            </Link>
            <Link href="/privacy" color="inherit" underline="hover">
              Privacy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 