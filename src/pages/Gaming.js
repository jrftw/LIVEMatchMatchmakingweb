import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function Gaming() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gaming
        </Typography>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <GroupIcon />
              </Avatar>
              <Typography variant="h5">
                Gaming Squads & Teams
              </Typography>
            </Box>
            
            <Typography variant="body1" paragraph>
              Coming soon! A new feature to help gamers create squads, groups, or teams with fun icons and customization options.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SportsEsportsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Squad Creation</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create and customize your gaming squad with unique icons and team colors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GroupIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Team Management</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Invite members, set roles, and manage your team's activities
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Team Achievements</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Track your squad's progress and celebrate victories together
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Chip
                label="Coming Soon"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '1.1rem', padding: '8px 16px' }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Gaming; 