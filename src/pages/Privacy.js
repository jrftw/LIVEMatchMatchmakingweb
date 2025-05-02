import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information that you provide directly to us, including:
        </Typography>
        <Box component="ul">
          <Typography component="li">Account information (name, email, password)</Typography>
          <Typography component="li">Profile information (photo, bio, preferences)</Typography>
          <Typography component="li">Content you create or share</Typography>
          <Typography component="li">Communication with other users</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        <Box component="ul">
          <Typography component="li">Provide and improve our services</Typography>
          <Typography component="li">Personalize your experience</Typography>
          <Typography component="li">Communicate with you</Typography>
          <Typography component="li">Ensure platform security</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          3. Information Sharing
        </Typography>
        <Typography variant="body1" paragraph>
          We do not sell your personal information. We may share your information with:
        </Typography>
        <Box component="ul">
          <Typography component="li">Service providers who assist in our operations</Typography>
          <Typography component="li">Other users as part of the service's functionality</Typography>
          <Typography component="li">Law enforcement when required by law</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          4. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to:
        </Typography>
        <Box component="ul">
          <Typography component="li">Access your personal information</Typography>
          <Typography component="li">Correct inaccurate information</Typography>
          <Typography component="li">Request deletion of your information</Typography>
          <Typography component="li">Opt-out of marketing communications</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          6. Cookies and Tracking
        </Typography>
        <Typography variant="body1" paragraph>
          We use cookies and similar tracking technologies to improve your experience and analyze usage patterns.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy, please contact us at privacy@livematch.com
        </Typography>
      </Paper>
    </Container>
  );
}

export default Privacy; 