import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing and using LiveMatch, you accept and agree to be bound by the terms and provision of this agreement.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. User Accounts
        </Typography>
        <Typography variant="body1" paragraph>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. User Conduct
        </Typography>
        <Typography variant="body1" paragraph>
          You agree not to use the service to:
        </Typography>
        <Box component="ul">
          <Typography component="li">Violate any laws or regulations</Typography>
          <Typography component="li">Infringe upon the rights of others</Typography>
          <Typography component="li">Distribute harmful or offensive content</Typography>
          <Typography component="li">Interfere with the service's operation</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          4. Content Ownership
        </Typography>
        <Typography variant="body1" paragraph>
          You retain ownership of any content you submit, post, or display on or through the service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute the content.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Termination
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date at the top of these terms.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about these Terms, please contact us at support@livematch.com
        </Typography>
      </Paper>
    </Container>
  );
}

export default Terms; 