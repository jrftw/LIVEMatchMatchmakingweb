import React from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar } from '@mui/material';
import {
  SportsEsports as SportsEsportsIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          About LiveMatch
        </Typography>
        <Typography variant="body1" paragraph>
          LiveMatch is a revolutionary platform designed to connect creators and gamers across various live streaming platforms. Our mission is to make live streaming more engaging, collaborative, and rewarding for everyone involved.
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SportsEsportsIcon />
              </Avatar>
              <Typography variant="h6">Live Matchmaking</Typography>
            </Box>
            <Typography variant="body1">
              Connect with other creators for live streaming collaborations. Our advanced matching algorithm helps you find the perfect streaming partners based on your content style, audience, and preferences.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="h6">Creator Networks</Typography>
            </Box>
            <Typography variant="body1">
              Join or create networks of creators to collaborate, share resources, and grow together. Our platform makes it easy to manage teams, schedule events, and track performance.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <EmojiEventsIcon />
              </Avatar>
              <Typography variant="h6">Tournaments & Events</Typography>
            </Box>
            <Typography variant="body1">
              Participate in or host tournaments and special events. Our platform provides all the tools you need to create, manage, and promote your events to a global audience.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SecurityIcon />
              </Avatar>
              <Typography variant="h6">Safe & Secure</Typography>
            </Box>
            <Typography variant="body1">
              We prioritize the safety and security of our users. Our platform includes robust verification systems, content moderation, and privacy controls to ensure a positive experience for everyone.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="body1" paragraph>
          LiveMatch is built by a passionate team of developers, designers, and content creators who understand the needs of the streaming community. We're constantly working to improve the platform and add new features based on user feedback.
        </Typography>
        <Typography variant="body1" paragraph>
          Join us in revolutionizing the way creators connect and collaborate in the live streaming space!
        </Typography>
      </Paper>
    </Container>
  );
}

export default About; 