import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function MyEvents() {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [tabValue]);

  const fetchEvents = async () => {
    const eventsRef = collection(db, 'events');
    let q;
    
    if (tabValue === 0) {
      q = query(eventsRef, where('participants', 'array-contains', 'currentUserId')); // TODO: Replace with actual user ID
    } else if (tabValue === 1) {
      q = query(eventsRef, where('organizerId', '==', 'currentUserId')); // TODO: Replace with actual user ID
    }

    const querySnapshot = await getDocs(q);
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEvents(eventsData);
  };

  const handleCancelEvent = async (eventId) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        status: 'cancelled'
      });
      fetchEvents();
    } catch (error) {
      console.error('Error cancelling event:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Events
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 4 }}
        >
          <Tab label="Attending" />
          <Tab label="Organizing" />
        </Tabs>

        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {event.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {event.platform}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {event.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={new Date(event.date).toLocaleDateString()}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={event.status}
                      color={event.status === 'upcoming' ? 'success' : 'error'}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${event.participants?.length || 0}/${event.maxParticipants} Participants`}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  {tabValue === 1 && event.status === 'upcoming' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleCancelEvent(event.id)}
                    >
                      Cancel Event
                    </Button>
                  )}
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default MyEvents; 