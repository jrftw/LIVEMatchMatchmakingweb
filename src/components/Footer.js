import React from 'react';
import { Box, Typography, Container, Link, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

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
            <Link component={RouterLink} to="/help" color="inherit" underline="hover">
              Help
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
              Terms
            </Link>
            <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
              Privacy
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" underline="hover">
              About
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
              Contact
            </Link>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            <IconButton
              color="inherit"
              component="a"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              color="inherit"
              component="a"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              color="inherit"
              component="a"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              color="inherit"
              component="a"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 