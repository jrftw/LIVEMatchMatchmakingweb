import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const matchesRef = collection(db, 'matches');
        const q = query(
          matchesRef,
          where('participants', 'array-contains', userId)
        );

        const querySnapshot = await getDocs(q);
        const matchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [auth.currentUser?.uid, db]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterMatches = () => {
    switch (tabValue) {
      case 0: // Upcoming
        return matches.filter(match => new Date(match.startTime) > new Date());
      case 1: // Past
        return matches.filter(match => new Date(match.startTime) <= new Date());
      default:
        return matches;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upcoming Matches" />
          <Tab label="Past Matches" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filterMatches().map((match) => (
          <Grid item xs={12} md={6} key={match.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {match.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(match.startTime).toLocaleString()}
                </Typography>
                <Typography variant="body2" paragraph>
                  Platform: {match.platform}
                </Typography>
                <Typography variant="body2" paragraph>
                  Game Type: {match.gameType}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    href={match.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {new Date(match.startTime) > new Date()
                      ? 'Join Match'
                      : 'View Results'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filterMatches().length === 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center">
              No matches found
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Matches; 