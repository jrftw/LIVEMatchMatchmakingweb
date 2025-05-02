import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

function Tournaments() {
  const [tabValue, setTabValue] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    platform: '',
    startDate: null,
    endDate: null,
    maxParticipants: 16,
    entryFee: 0,
    prizePool: 0,
    rules: '',
    status: 'upcoming',
  });

  useEffect(() => {
    fetchTournaments();
  }, [tabValue]);

  const fetchTournaments = async () => {
    const tournamentsRef = collection(db, 'tournaments');
    let q;
    
    if (tabValue === 0) {
      q = query(tournamentsRef, where('status', '==', 'upcoming'));
    } else if (tabValue === 1) {
      q = query(tournamentsRef, where('status', '==', 'ongoing'));
    } else {
      q = query(tournamentsRef, where('status', '==', 'completed'));
    }

    const querySnapshot = await getDocs(q);
    const tournamentsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTournaments(tournamentsData);
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      const tournamentRef = await addDoc(collection(db, 'tournaments'), {
        ...newTournament,
        createdAt: new Date(),
        participants: [],
        matches: [],
      });
      
      setNewTournament({
        name: '',
        description: '',
        platform: '',
        startDate: null,
        endDate: null,
        maxParticipants: 16,
        entryFee: 0,
        prizePool: 0,
        rules: '',
        status: 'upcoming',
      });
      
      fetchTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    try {
      const tournamentRef = doc(db, 'tournaments', tournamentId);
      await updateDoc(tournamentRef, {
        participants: arrayUnion('currentUserId') // TODO: Replace with actual user ID
      });
      fetchTournaments();
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 4 }}
        >
          <Tab label="Upcoming" />
          <Tab label="Ongoing" />
          <Tab label="Completed" />
        </Tabs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create New Tournament
              </Typography>
              <form onSubmit={handleCreateTournament}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tournament Name"
                      value={newTournament.name}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={newTournament.description}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Platform</InputLabel>
                      <Select
                        value={newTournament.platform}
                        onChange={(e) => setNewTournament(prev => ({ ...prev, platform: e.target.value }))}
                        label="Platform"
                        required
                      >
                        <MenuItem value="TikTok">TikTok</MenuItem>
                        <MenuItem value="Favorited">Favorited</MenuItem>
                        <MenuItem value="Bigo">Bigo</MenuItem>
                        <MenuItem value="Mango">Mango</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={newTournament.startDate}
                      onChange={(date) => setNewTournament(prev => ({ ...prev, startDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={newTournament.endDate}
                      onChange={(date) => setNewTournament(prev => ({ ...prev, endDate: date }))}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Participants"
                      value={newTournament.maxParticipants}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Entry Fee"
                      value={newTournament.entryFee}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseFloat(e.target.value) }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Prize Pool"
                      value={newTournament.prizePool}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, prizePool: parseFloat(e.target.value) }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Rules"
                      value={newTournament.rules}
                      onChange={(e) => setNewTournament(prev => ({ ...prev, rules: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Create Tournament
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {tournaments.map((tournament) => (
                <Grid item xs={12} key={tournament.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {tournament.name}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {tournament.platform}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {tournament.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`${tournament.participants?.length || 0}/${tournament.maxParticipants} Participants`}
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`$${tournament.prizePool} Prize Pool`}
                          color="secondary"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`$${tournament.entryFee} Entry Fee`}
                          color="default"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        <strong>Start Date:</strong> {tournament.startDate?.toDate().toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>End Date:</strong> {tournament.endDate?.toDate().toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleJoinTournament(tournament.id)}
                      >
                        Join Tournament
                      </Button>
                      <Button size="small">View Details</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Tournaments; 