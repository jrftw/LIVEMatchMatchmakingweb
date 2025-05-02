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
  Checkbox,
  FormControlLabel,
  Switch,
  CircularProgress,
  ListItemText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, Timestamp, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

function Tournaments() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [brackets, setBrackets] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [bracketName, setBracketName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('1v1');
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [otherPlatform, setOtherPlatform] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [description, setDescription] = useState('');
  const [bracketStartDate, setBracketStartDate] = useState(null);
  const [bracketEndDate, setBracketEndDate] = useState(null);
  const [entryFeeType, setEntryFeeType] = useState('free');
  const [entryFeeAmount, setEntryFeeAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState(null);
  const [paymentUsername, setPaymentUsername] = useState('');
  const [prizeType, setPrizeType] = useState('none');
  const [prizeAmount, setPrizeAmount] = useState(0);
  const [autoPairing, setAutoPairing] = useState(true);
  const [bracketTimeSlots, setBracketTimeSlots] = useState([0, 15, 30, 45]);
  const [bracketSelectedTimes, setBracketSelectedTimes] = useState([]);
  const [bracketUse12Hour, setBracketUse12Hour] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchBrackets();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchBrackets = async () => {
    try {
      setLoading(true);
      const tournaments = await apiService.get('/api/tournaments');
      setBrackets(tournaments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brackets:', error);
      setError('Failed to fetch brackets');
      setLoading(false);
    }
  };

  const handleCreateBracket = async () => {
    try {
      if (!bracketName) {
        alert('Please enter a bracket name');
        return;
      }

      if (!bracketStartDate || !bracketEndDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (selectedPlatform === 'other' && !otherPlatform) {
        alert('Please enter the other platform name');
        return;
      }

      if (entryFeeType !== 'free' && (!paymentMethod || !paymentDueDate || !paymentUsername)) {
        alert('Please fill in all payment details');
        return;
      }

      const bracketData = {
        name: bracketName,
        format: selectedFormat,
        platform: selectedPlatform === 'other' ? otherPlatform : selectedPlatform,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName,
        participants: [currentUser.uid],
        status: 'open',
        startDate: bracketStartDate.toISOString(),
        endDate: bracketEndDate.toISOString(),
        maxPlayers,
        description,
        autoPairing,
        timeSlots: bracketTimeSlots,
        selectedTimes: bracketSelectedTimes,
        prize: {
          type: prizeType,
          amount: prizeType !== 'none' ? prizeAmount : 0
        },
        entryFee: {
          type: entryFeeType,
          amount: entryFeeType !== 'free' ? entryFeeAmount : 0,
          paymentMethod: entryFeeType !== 'free' ? paymentMethod : null,
          dueDate: entryFeeType !== 'free' ? paymentDueDate.toISOString() : null,
          destinationUsername: entryFeeType !== 'free' ? paymentUsername : null
        }
      };

      await apiService.post('/api/tournaments', bracketData);
      setShowCreateDialog(false);
      fetchBrackets();

      // Reset form
      setBracketName('');
      setSelectedFormat('1v1');
      setSelectedPlatform('TikTok');
      setOtherPlatform('');
      setMaxPlayers(8);
      setDescription('');
      setPrizeType('none');
      setPrizeAmount(0);
      setEntryFeeType('free');
      setEntryFeeAmount(0);
      setPaymentMethod('');
      setPaymentDueDate(null);
      setPaymentUsername('');
      setBracketStartDate(null);
      setBracketEndDate(null);
      setBracketTimeSlots([0, 15, 30, 45]);
      setBracketSelectedTimes([]);
    } catch (error) {
      console.error('Error creating bracket:', error);
      setError('Failed to create bracket');
    }
  };

  const handleJoinBracket = async (bracketId) => {
    try {
      const bracketRef = doc(db, 'brackets', bracketId);
      const bracketDoc = await getDoc(bracketRef);
      const bracketData = bracketDoc.data();

      if (bracketData.participants.length >= bracketData.maxPlayers) {
        alert('This bracket is full!');
        return;
      }

      if (bracketData.participants.includes(currentUser.uid)) {
        alert('You are already in this bracket!');
        return;
      }

      await updateDoc(bracketRef, {
        participants: arrayUnion(currentUser.uid)
      });

      alert('Successfully joined the bracket!');
      fetchBrackets();
    } catch (error) {
      console.error('Error joining bracket:', error);
      alert('Failed to join bracket. Please try again.');
    }
  };

  const formatTimeSlot = (hour, minute, use12Hour) => {
    const time = new Date();
    time.setHours(hour, minute, 0);
    return use12Hour ? time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Upcoming" />
            <Tab label="Ongoing" />
            <Tab label="Completed" />
          </Tabs>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreateDialog(true)}
          >
            Create Bracket
          </Button>
        </Box>

        <Grid container spacing={3}>
          {brackets.map((bracket) => (
            <Grid item xs={12} sm={6} md={4} key={bracket.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {bracket.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {bracket.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`${bracket.participants?.length || 0}/${bracket.maxPlayers} Players`}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={bracket.format}
                      color="secondary"
                      sx={{ mr: 1 }}
                    />
                    {bracket.autoPairing && (
                      <Chip
                        label="Auto-Pairing"
                        color="success"
                      />
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Platform:</strong> {bracket.platform}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Start:</strong> {bracket.startDate?.toDate().toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>End:</strong> {bracket.endDate?.toDate().toLocaleDateString()}
                    </Typography>
                    {bracket.entryFee?.type !== 'free' && (
                      <Typography variant="body2">
                        <strong>Entry Fee:</strong> ${bracket.entryFee?.amount}
                      </Typography>
                    )}
                    {bracket.prize?.type !== 'none' && (
                      <Typography variant="body2">
                        <strong>Prize:</strong> ${bracket.prize?.amount}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  {bracket.status === 'open' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleJoinBracket(bracket.id)}
                    >
                      Join Bracket
                    </Button>
                  )}
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Bracket</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bracket Name"
                  value={bracketName}
                  onChange={(e) => setBracketName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Match Format</InputLabel>
                  <Select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    label="Match Format"
                  >
                    <MenuItem value="1v1">1v1</MenuItem>
                    <MenuItem value="2v2">2v2</MenuItem>
                    <MenuItem value="1v1v1v1">1v1v1v1</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    label="Platform"
                  >
                    <MenuItem value="TikTok">TikTok</MenuItem>
                    <MenuItem value="Favorited">Favorited</MenuItem>
                    <MenuItem value="Bigo">Bigo</MenuItem>
                    <MenuItem value="Mango">Mango</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {selectedPlatform === 'other' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Other Platform Name"
                    value={otherPlatform}
                    onChange={(e) => setOtherPlatform(e.target.value)}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Players"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Math.min(500, Math.max(2, parseInt(e.target.value) || 2)))}
                  inputProps={{ min: 2, max: 500 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={bracketStartDate}
                  onChange={(newValue) => setBracketStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={bracketEndDate}
                  onChange={(newValue) => setBracketEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Entry Fee Type</InputLabel>
                  <Select
                    value={entryFeeType}
                    onChange={(e) => setEntryFeeType(e.target.value)}
                    label="Entry Fee Type"
                  >
                    <MenuItem value="free">Free</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="gift">Platform Gift</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {entryFeeType !== 'free' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Entry Fee Amount"
                      value={entryFeeAmount}
                      onChange={(e) => setEntryFeeAmount(parseFloat(e.target.value))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        label="Payment Method"
                        required
                      >
                        <MenuItem value="cashapp">Cash App</MenuItem>
                        <MenuItem value="venmo">Venmo</MenuItem>
                        <MenuItem value="paypal">PayPal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Payment Username"
                      value={paymentUsername}
                      onChange={(e) => setPaymentUsername(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Payment Due Date"
                      value={paymentDueDate}
                      onChange={(newValue) => setPaymentDueDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Prize Type</InputLabel>
                  <Select
                    value={prizeType}
                    onChange={(e) => setPrizeType(e.target.value)}
                    label="Prize Type"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="gift">Platform Gift</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {prizeType !== 'none' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prize Amount"
                    value={prizeAmount}
                    onChange={(e) => setPrizeAmount(parseFloat(e.target.value))}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoPairing}
                      onChange={(e) => setAutoPairing(e.target.checked)}
                    />
                  }
                  label="Enable Auto-Pairing"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Time Slots</InputLabel>
                  <Select
                    multiple
                    value={bracketTimeSlots}
                    onChange={(e) => setBracketTimeSlots(e.target.value)}
                    label="Time Slots"
                    renderValue={(selected) => selected.map(slot => `${slot} minutes`).join(', ')}
                  >
                    <MenuItem value={0}>:00</MenuItem>
                    <MenuItem value={15}>:15</MenuItem>
                    <MenuItem value={30}>:30</MenuItem>
                    <MenuItem value={45}>:45</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Times</InputLabel>
                  <Select
                    multiple
                    value={bracketSelectedTimes}
                    onChange={(e) => setBracketSelectedTimes(e.target.value)}
                    label="Select Times"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {Array.from({ length: 24 }, (_, hour) => 
                      bracketTimeSlots.map(minute => formatTimeSlot(hour, minute, bracketUse12Hour))
                    ).flat().map((time) => (
                      <MenuItem key={time} value={time}>
                        <Checkbox checked={bracketSelectedTimes.indexOf(time) > -1} />
                        <ListItemText primary={time} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBracket} variant="contained" color="primary">
              Create Bracket
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Tournaments; 