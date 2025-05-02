import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Chip,
  Link,
  CircularProgress,
} from '@mui/material';

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [db, id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4 }}>
          Profile not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3, mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={profile.photoURL}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h5">{profile.displayName}</Typography>
            <Typography color="textSecondary">@{profile.username}</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Bio
            </Typography>
            <Typography paragraph>{profile.bio || 'No bio provided'}</Typography>

            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ mb: 2 }}>
              {profile.tags?.map((tag) => (
                <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Platform Usernames
            </Typography>
            {Object.entries(profile.platformUsernames || {}).map(([platform, username]) => (
              <Typography key={platform}>
                {platform}: {username}
              </Typography>
            ))}

            <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
              Links
            </Typography>
            {profile.links?.map((link, index) => (
              <Link
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                display="block"
              >
                {link}
              </Link>
            ))}

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Matches Won</Typography>
                  <Typography variant="h6">{profile.matchesWon || 0}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Tournaments Won</Typography>
                  <Typography variant="h6">{profile.tournamentsWon || 0}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Points</Typography>
                  <Typography variant="h6">{profile.points || 0}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile; 