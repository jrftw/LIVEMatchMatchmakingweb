import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  FormGroup,
  useTheme,
  useMediaQuery,
  Switch,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import SwipeableViews from 'react-swipeable-views';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AddIcon from '@mui/icons-material/Add';
import { Remove as RemoveIcon } from '@mui/icons-material';
import { autoPairCreators, generateWeeklyEvents, manualPairCreators } from '../utils/matchmakingUtils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { apiService } from '../services/api';

function Matchmaking() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [matches, setMatches] = useState([]);
  const [brackets, setBrackets] = useState([]);
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [availability, setAvailability] = useState({
    monday: { 
      available: false,
      slots: Array(96).fill(false) // 24 hours * 4 (15-minute intervals)
    },
    tuesday: { 
      available: false,
      slots: Array(96).fill(false)
    },
    wednesday: { 
      available: false,
      slots: Array(96).fill(false)
    },
    thursday: { 
      available: false,
      slots: Array(96).fill(false)
    },
    friday: { 
      available: false,
      slots: Array(96).fill(false)
    },
    saturday: { 
      available: false,
      slots: Array(96).fill(false)
    },
    sunday: { 
      available: false,
      slots: Array(96).fill(false)
    },
  });
  const [newBracket, setNewBracket] = useState({
    title: '',
    platform: 'TikTok', // Default platform
    otherPlatform: '', // For when "other" is selected
    gameFormat: 'single',
    maxPlayers: 8,
    startDate: null,
    endDate: null,
    prizePool: 0,
    entryFee: 0,
    paymentMethod: 'free',
    paymentDetails: {
      cashapp: '',
      venmo: '',
      paypal: '',
      platformGifts: false,
      platformUsername: '',
    },
    paymentDueDate: null,
    rules: '',
  });
  const [showBracketDialog, setShowBracketDialog] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [weeklyBrackets, setWeeklyBrackets] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('1v1');
  const [selectedGameType, setSelectedGameType] = useState('');
  const [squadName, setSquadName] = useState('');
  const [squadDescription, setSquadDescription] = useState('');
  const [squadTags, setSquadTags] = useState([]);
  const [squadMembers, setSquadMembers] = useState([]);
  const [squadInvites, setSquadInvites] = useState([]);
  const [showSquadDialog, setShowSquadDialog] = useState(false);
  const [showBoxBattleDialog, setShowBoxBattleDialog] = useState(false);
  const [boxBattleParticipants, setBoxBattleParticipants] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [squads, setSquads] = useState([]);
  const [squadId, setSquadId] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [userStats, setUserStats] = useState({
    matchesPlayed: 0,
    winRate: 0,
    favoriteGame: 'None'
  });
  const [topGames, setTopGames] = useState([
    { id: 1, name: 'Fortnite', activePlayers: 1200, icon: '🎮' },
    { id: 2, name: 'Call of Duty', activePlayers: 950, icon: '🔫' },
    { id: 3, name: 'Valorant', activePlayers: 800, icon: '🎯' },
    { id: 4, name: 'Apex Legends', activePlayers: 700, icon: '🏃' },
    { id: 5, name: 'League of Legends', activePlayers: 600, icon: '⚔️' }
  ]);
  const navigate = useNavigate();
  const auth = getAuth();

  // Match preferences state
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['TikTok']); // Default to TikTok
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [selectedMatchType, setSelectedMatchType] = useState('quick');
  const [bracketName, setBracketName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [entryFeeType, setEntryFeeType] = useState('free');
  const [entryFeeAmount, setEntryFeeAmount] = useState(0);
  const [participantCount, setParticipantCount] = useState(9);
  const [boxBattleEntryFeeType, setBoxBattleEntryFeeType] = useState('free');
  const [boxBattleEntryFeeAmount, setBoxBattleEntryFeeAmount] = useState(0);
  const [numberOfMatches, setNumberOfMatches] = useState(1);
  const [otherPlatform, setOtherPlatform] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [matchType, setMatchType] = useState('single');
  const [description, setDescription] = useState('');
  const [prizeType, setPrizeType] = useState('none');
  const [prizeAmount, setPrizeAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState(null);
  const [paymentUsername, setPaymentUsername] = useState('');
  const [boxBattleName, setBoxBattleName] = useState('');
  const [boxBattlePlatform, setBoxBattlePlatform] = useState('TikTok');
  const [boxBattleOtherPlatform, setBoxBattleOtherPlatform] = useState('');
  const [boxBattleDescription, setBoxBattleDescription] = useState('');
  const [boxBattlePrizeType, setBoxBattlePrizeType] = useState('none');
  const [boxBattlePrizeAmount, setBoxBattlePrizeAmount] = useState(0);
  const [boxBattlePaymentMethod, setBoxBattlePaymentMethod] = useState('');
  const [boxBattlePaymentDueDate, setBoxBattlePaymentDueDate] = useState(null);
  const [boxBattlePaymentUsername, setBoxBattlePaymentUsername] = useState('');

  // New fields for bracket date range and day selection
  const [bracketStartDate, setBracketStartDate] = useState(null);
  const [bracketEndDate, setBracketEndDate] = useState(null);
  const [bracketSelectedDays, setBracketSelectedDays] = useState([]);
  const [bracketSelectedTimes, setBracketSelectedTimes] = useState([]);
  const [bracketUse12Hour, setBracketUse12Hour] = useState(true);
  const [bracketTimeSlots, setBracketTimeSlots] = useState([0, 15, 30, 45]);

  // New fields for box battle date range and day selection
  const [boxBattleStartDate, setBoxBattleStartDate] = useState(null);
  const [boxBattleEndDate, setBoxBattleEndDate] = useState(null);
  const [boxBattleSelectedDays, setBoxBattleSelectedDays] = useState([]);
  const [boxBattleSelectedTimes, setBoxBattleSelectedTimes] = useState([]);
  const [boxBattleUse12Hour, setBoxBattleUse12Hour] = useState(true);
  const [boxBattleTimeSlots, setBoxBattleTimeSlots] = useState([0, 15, 30, 45]);

  // Add these new state variables
  const [autoPairing, setAutoPairing] = useState(true);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [compatibleUsers, setCompatibleUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showManualPairing, setShowManualPairing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Add responsive styles
  const responsiveStyles = {
    container: {
      py: isMobile ? 2 : 4,
      px: isMobile ? 1 : 2,
    },
    card: {
      mb: isMobile ? 2 : 3,
      p: isMobile ? 1 : 2,
    },
    gridContainer: {
      spacing: isMobile ? 1 : 3,
    },
    gridItem: {
      xs: 12,
      sm: isTablet ? 6 : 12,
      md: isDesktop ? 4 : 6,
    },
    formControl: {
      width: '100%',
      mb: isMobile ? 1 : 2,
    },
    button: {
      width: '100%',
      mt: isMobile ? 1 : 2,
      mb: isMobile ? 1 : 2,
    },
    typography: {
      variant: isMobile ? 'body2' : 'body1',
      gutterBottom: true,
    },
    tabs: {
      mb: isMobile ? 1 : 3,
      '& .MuiTab-root': {
        minWidth: isMobile ? 'auto' : '120px',
        padding: isMobile ? '6px 12px' : '12px 24px',
      },
    },
    availabilityGrid: {
      container: true,
      spacing: isMobile ? 1 : 2,
    },
    timeSlot: {
      width: isMobile ? '100%' : 'auto',
      mb: isMobile ? 1 : 0,
    },
    matchCard: {
      height: isMobile ? 'auto' : '600px',
      position: 'relative',
      p: isMobile ? 1 : 2,
    },
    avatar: {
      width: isMobile ? 60 : 100,
      height: isMobile ? 60 : 100,
    },
    chip: {
      m: isMobile ? 0.25 : 0.5,
    },
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchUserData = async (user) => {
    try {
      setLoading(true);
      // Fetch available matches from the API
      const matches = await apiService.get('/api/matches');
      setMatches(matches.filter(match => match.uid !== user.uid) || []);

      // Fetch available tournaments from the API
      const tournaments = await apiService.get('/api/tournaments');
      setBrackets(tournaments || []);

      // Set hasAvailability based on user data
      setHasAvailability(!!matches.find(m => m.uid === user.uid)?.availability);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAvailabilityChange = (day, slotIndex, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, index) => 
          index === slotIndex ? value : slot
        )
      }
    }));
  };

  const handleDayToggle = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available
      }
    }));
  };

  const formatTime12Hour = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatTime24Hour = (time12Hour) => {
    const [time, period] = time12Hour.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleTimezoneChange = (event) => {
    setUserTimezone(event.target.value);
  };

  const handleAvailabilitySubmit = async () => {
    try {
      await apiService.post('/api/matches', {
        userId: currentUser.uid,
        availability,
      });
      setHasAvailability(true);
      fetchUserData(currentUser);
    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update availability');
    }
  };

  const handleMatch = async (matchId, action) => {
    try {
      if (action === 'accept') {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          matches: arrayUnion(matchId)
        });
        await updateDoc(doc(db, 'users', matchId), {
          matches: arrayUnion(currentUser.uid)
        });
      }
      setMatches(prev => prev.filter(match => match.id !== matchId));
    } catch (error) {
      console.error('Error handling match:', error);
      setError('Failed to process match');
    }
  };

  const createBracket = async () => {
    try {
      await addDoc(collection(db, 'brackets'), {
        ...newBracket,
        creatorId: currentUser.uid,
        status: 'open',
        participants: [],
        createdAt: new Date().toISOString(),
      });
      setShowBracketDialog(false);
      setNewBracket({
        title: '',
        platform: 'TikTok',
        otherPlatform: '',
        gameFormat: 'single',
        maxPlayers: 8,
        startDate: null,
        endDate: null,
        prizePool: 0,
        entryFee: 0,
        paymentMethod: 'free',
        paymentDetails: {
          cashapp: '',
          venmo: '',
          paypal: '',
          platformGifts: false,
          platformUsername: '',
        },
        paymentDueDate: null,
        rules: '',
      });
      fetchUserData(currentUser);
    } catch (error) {
      console.error('Error creating bracket:', error);
      setError('Failed to create bracket');
    }
  };

  const joinBracket = async (bracketId) => {
    try {
      await apiService.post(`/api/tournaments/${bracketId}/join`, {
        userId: currentUser.uid,
      });
      fetchUserData(currentUser);
    } catch (error) {
      console.error('Error joining bracket:', error);
      setError('Failed to join bracket');
    }
  };

  const handlePaymentMethodChange = (event) => {
    setNewBracket(prev => ({
      ...prev,
      paymentMethod: event.target.value,
      entryFee: event.target.value === 'free' ? 0 : prev.entryFee
    }));
  };

  const handlePaymentDetailChange = (platform, value) => {
    setNewBracket(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [platform]: value
      }
    }));
  };

  // Generate random bracket names and details
  const generateRandomBracketName = () => {
    const prefixes = ['Elite', 'Pro', 'Champion', 'Master', 'Legendary', 'Epic', 'Ultimate'];
    const suffixes = ['Showdown', 'Clash', 'Battle', 'Tournament', 'Challenge', 'Cup', 'Series'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${randomPrefix} ${randomSuffix}`;
  };

  const generateRandomPrize = () => {
    const prizes = ['Exclusive Badge', 'Featured Profile', 'Platform Gift', 'Creator Spotlight'];
    return prizes[Math.floor(Math.random() * prizes.length)];
  };

  // Generate weekly free brackets
  const generateWeeklyBrackets = async () => {
    try {
      const brackets = [
        {
          id: 'weekly-free-for-all',
          name: 'Weekly Free-for-All',
          type: 'bracket',
          format: '1v1',
          platform: 'TikTok',
          maxPlayers: 16,
          status: 'open',
          isWeekly: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          description: 'Join our weekly free-for-all tournament! Open to all creators.',
          prize: {
            type: 'featured',
            amount: 0
          },
          entryFee: {
            type: 'free',
            amount: 0
          },
          participants: [],
          autoPairing: true
        },
        {
          id: 'weekly-box-battle',
          name: 'Weekly Box Battle',
          type: 'box_battle',
          platform: 'TikTok',
          maxPlayers: 9,
          status: 'open',
          isWeekly: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          description: 'Weekly box battle tournament - perfect for content creators!',
          prize: {
            type: 'featured',
            amount: 0
          },
          entryFee: {
            type: 'free',
            amount: 0
          },
          participants: [],
          autoPairing: true
        }
      ];

      // Add brackets to Firestore
      for (const bracket of brackets) {
        await addDoc(collection(db, 'matches'), bracket);
      }

      setWeeklyBrackets(brackets);
    } catch (error) {
      console.error('Error generating weekly brackets:', error);
    }
  };

  // Check user availability
  const checkUserAvailability = async (userId) => {
    try {
      const userDoc = await getDocs(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData?.availability) return false;
      
      // Check if any day has available time slots
      return Object.values(userData.availability).some(day => 
        day.available && day.timeRanges && day.timeRanges.length > 0
      );
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  // Auto-pair creators based on availability
  const autoPairCreators = async () => {
    try {
      const usersRef = collection(db, 'users');
      const availableUsers = await getDocs(query(
        usersRef,
        where('lookingForMatches', '==', true)
      ));

      const users = availableUsers.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group users by platform
      const platformGroups = {};
      users.forEach(user => {
        if (!platformGroups[user.platform]) {
          platformGroups[user.platform] = [];
        }
        platformGroups[user.platform].push(user);
      });

      // Find matching time slots for each platform group
      for (const [platform, platformUsers] of Object.entries(platformGroups)) {
        for (let i = 0; i < platformUsers.length; i++) {
          for (let j = i + 1; j < platformUsers.length; j++) {
            const user1 = platformUsers[i];
            const user2 = platformUsers[j];
            
            if (haveMatchingAvailability(user1.availability, user2.availability)) {
              // Create a match
              await addDoc(collection(db, 'matches'), {
                user1Id: user1.id,
                user2Id: user2.id,
                platform,
                status: 'pending',
                createdAt: Timestamp.now(),
                proposedTimes: findMatchingTimeSlots(user1.availability, user2.availability)
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error auto-pairing creators:', error);
    }
  };

  // Helper function to check if two users have matching availability
  const haveMatchingAvailability = (availability1, availability2) => {
    for (const day of Object.keys(availability1)) {
      if (availability1[day].available && availability2[day].available) {
        const matchingSlots = availability1[day].slots.filter((slot, index) => 
          slot && availability2[day].slots[index]
        );
        if (matchingSlots.length > 0) return true;
      }
    }
    return false;
  };

  // Helper function to find matching time slots
  const findMatchingTimeSlots = (availability1, availability2) => {
    const matchingSlots = [];
    for (const day of Object.keys(availability1)) {
      if (availability1[day].available && availability2[day].available) {
        availability1[day].slots.forEach((slot, index) => {
          if (slot && availability2[day].slots[index]) {
            const hour = Math.floor(index / 4);
            const minute = (index % 4) * 15;
            matchingSlots.push({
              day,
              time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            });
          }
        });
      }
    }
    return matchingSlots;
  };

  useEffect(() => {
    // Check if user has availability set up
    const checkAvailability = async () => {
      if (currentUser) {
        const hasAvail = await checkUserAvailability(currentUser.uid);
        setHasAvailability(hasAvail);
      }
    };
    checkAvailability();

    // Generate weekly brackets on component mount
    generateWeeklyBrackets();

    // Auto-pair creators every hour
    const pairingInterval = setInterval(autoPairCreators, 60 * 60 * 1000);
    return () => clearInterval(pairingInterval);
  }, [currentUser]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData?.stats) {
            setUserStats({
              matchesPlayed: userData.stats.matchesPlayed || 0,
              winRate: userData.stats.winRate || 0,
              favoriteGame: userData.stats.favoriteGame || 'None'
            });
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }
      }
    };

    fetchUserStats();
  }, [currentUser]);

  // Add null checks in the UI rendering
  const renderAvailabilitySlots = (day) => {
    const dayData = availability[day] || { available: false, slots: Array(96).fill(false) };
    if (!dayData.available) return null;

    return (
      <Grid container spacing={1}>
        {Array.from({ length: 24 }).map((_, hour) => (
          <Grid item xs={12} key={hour}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ width: 80, mr: 1 }}>
                {formatTime12Hour(hour, 0)}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[0, 15, 30, 45].map((minute) => {
                  const slotIndex = hour * 4 + (minute / 15);
                  return (
                    <FormControlLabel
                      key={minute}
                      control={
                        <Checkbox
                          size="small"
                          checked={dayData.slots?.[slotIndex] || false}
                          onChange={(e) => handleAvailabilityChange(day, slotIndex, e.target.checked)}
                        />
                      }
                      label={formatTime12Hour(hour, minute)}
                    />
                  );
                })}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  const matchFormats = [
    { id: '1v1', name: '1v1', maxPlayers: 2 },
    { id: '2v2', name: '2v2', maxPlayers: 4 },
    { id: '1v1v1v1', name: '1v1v1v1', maxPlayers: 4 },
    { id: '3v1', name: '3v1', maxPlayers: 4 },
    { id: 'box_battle', name: 'Box Battle', maxPlayers: 9 },
  ];

  const gameTypes = [
    'Battle Royale',
    'FPS',
    'MOBA',
    'Racing',
    'Sports',
    'Fighting',
    'Strategy',
    'Other'
  ];

  const handleSwipe = async (direction) => {
    if (suggestedMatches.length === 0) return;

    const currentMatch = suggestedMatches[0];
    if (direction === 'right') {
      // Accept match
      try {
        await updateDoc(doc(db, 'matches', currentMatch.id), {
          participants: arrayUnion(currentUser.uid)
        });
      } catch (error) {
        console.error('Error accepting match:', error);
      }
    }
    // Remove the current match from suggestions
    setSuggestedMatches(suggestedMatches.slice(1));
  };

  const handleCreateMatch = async () => {
    try {
      if (autoPairing) {
        const pairs = await autoPairCreators(selectedMatchType, {
          platform: selectedPlatform,
          format: selectedFormat,
          timezone: userTimezone
        });

        if (pairs.length > 0) {
          alert(`Found ${pairs.length} compatible pairs!`);
          setCompatibleUsers(pairs);
          setShowManualPairing(true);
        } else {
          alert('No compatible pairs found. Would you like to try manual pairing?');
          setShowManualPairing(true);
        }
      } else {
        setShowManualPairing(true);
      }
    } catch (error) {
      console.error('Error in match creation:', error);
    }
  };

  // Fetch suggested matches based on availability and preferences
  useEffect(() => {
    const fetchSuggestedMatches = async () => {
      if (!currentUser || selectedFormats.length === 0) return;

      try {
        const matchesQuery = query(
          collection(db, 'matches'),
          where('status', '==', selectedMatchType),
          where('type', 'in', selectedFormats)
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matches = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter matches based on availability
        const availableMatches = matches.filter(match => {
          // Add availability matching logic here
          return true; // Placeholder
        });

        setSuggestedMatches(availableMatches);
      } catch (error) {
        console.error('Error fetching suggested matches:', error);
      }
    };

    fetchSuggestedMatches();
  }, [currentUser, selectedFormats, selectedMatchType]);

  const handleCreateSquad = async () => {
    try {
      const squadData = {
        name: squadName,
        description: squadDescription,
        tags: squadTags,
        creatorId: currentUser.uid,
        members: [currentUser.uid],
        createdAt: Timestamp.now(),
        gameType: selectedGameType,
        status: 'active'
      };

      await addDoc(collection(db, 'squads'), squadData);
      setShowSquadDialog(false);
      resetSquadForm();
    } catch (error) {
      console.error('Error creating squad:', error);
    }
  };

  const resetSquadForm = () => {
    setSquadName('');
    setSquadDescription('');
    setSquadTags([]);
    setSelectedGameType('');
  };

  const handleInviteToSquad = async (userId) => {
    try {
      await addDoc(collection(db, 'squadInvites'), {
        squadId: squadId,
        userId: userId,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      setSquadInvites([...squadInvites, userId]);
    } catch (error) {
      console.error('Error sending squad invite:', error);
    }
  };

  const handleJoinMatch = async (matchId) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      const matchData = matchDoc.data();

      if (matchData.participants.length < matchData.maxPlayers) {
        await updateDoc(matchRef, {
          participants: arrayUnion(currentUser.uid)
        });
        // Refresh matches list
        fetchUserData(currentUser);
      }
    } catch (error) {
      console.error('Error joining match:', error);
    }
  };

  const handleJoinSquad = async (squadId) => {
    try {
      const squadRef = doc(db, 'squads', squadId);
      const squadDoc = await getDoc(squadRef);
      const squadData = squadDoc.data();

      if (!squadData.members.includes(currentUser.uid)) {
        await updateDoc(squadRef, {
          members: arrayUnion(currentUser.uid)
        });
        // Refresh squads list
        fetchSquads();
      }
    } catch (error) {
      console.error('Error joining squad:', error);
    }
  };

  const fetchSquads = async () => {
    try {
      const squadsQuery = query(
        collection(db, 'squads'),
        where('status', '==', 'active')
      );
      const squadsSnapshot = await getDocs(squadsQuery);
      const squadsData = squadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSquads(squadsData);
    } catch (error) {
      console.error('Error fetching squads:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSquads();
    }
  }, [currentUser]);

  const handleCreateMatches = async () => {
    try {
      if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (selectedDays.length === 0) {
        alert('Please select at least one day');
        return;
      }

      if (selectedTimes.length === 0) {
        alert('Please select at least one time slot');
        return;
      }

      const availability = selectedDays.map(day => ({
        day: day.toLowerCase(),
        slots: selectedTimes.map(time => formatTime24Hour(time))
      }));

      for (let i = 0; i < numberOfMatches; i++) {
        const matchData = {
          type: 'match',
          format: selectedFormat,
          platform: selectedPlatform === 'other' ? otherPlatform : selectedPlatform,
          creatorId: currentUser.uid,
          creatorName: currentUser.displayName,
          participants: [currentUser.uid],
          status: 'open',
          createdAt: Timestamp.now(),
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          maxPlayers: matchFormats.find(f => f.id === selectedFormat).maxPlayers,
          availability
        };
        await addDoc(collection(db, 'matches'), matchData);
      }

      // Reset form
      setNumberOfMatches(1);
      setSelectedFormat('1v1');
      setSelectedPlatform('TikTok');
      setOtherPlatform('');
      setStartDate(null);
      setEndDate(null);
      setSelectedDays([]);
      setSelectedTimes([]);
    } catch (error) {
      console.error('Error creating matches:', error);
    }
  };

  // Add this helper function for time formatting
  const formatTimeSlot = (hour, minute, use12Hour) => {
    if (use12Hour) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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

      if (bracketSelectedDays.length === 0) {
        alert('Please select at least one day');
        return;
      }

      if (bracketSelectedTimes.length === 0) {
        alert('Please select at least one time slot');
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

      const availability = bracketSelectedDays.map(day => ({
        day: day.toLowerCase(),
        slots: bracketSelectedTimes.map(time => {
          const [timeStr, period] = time.split(' ');
          const [hours, minutes] = timeStr.split(':');
          let hour = parseInt(hours);
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, '0')}:${minutes}`;
        })
      }));

      const bracketData = {
        type: 'bracket',
        name: bracketName,
        format: selectedFormat,
        matchType,
        platform: selectedPlatform === 'other' ? otherPlatform : selectedPlatform,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName,
        participants: [currentUser.uid],
        status: 'open',
        createdAt: Timestamp.now(),
        startDate: Timestamp.fromDate(bracketStartDate),
        endDate: Timestamp.fromDate(bracketEndDate),
        maxPlayers,
        description,
        availability,
        prize: {
          type: prizeType,
          amount: prizeType !== 'none' ? prizeAmount : 0
        },
        entryFee: {
          type: entryFeeType,
          amount: entryFeeType !== 'free' ? entryFeeAmount : 0,
          paymentMethod: entryFeeType !== 'free' ? paymentMethod : null,
          dueDate: entryFeeType !== 'free' ? Timestamp.fromDate(paymentDueDate) : null,
          destinationUsername: entryFeeType !== 'free' ? paymentUsername : null
        }
      };

      await addDoc(collection(db, 'matches'), bracketData);

      // Reset form
      setBracketName('');
      setSelectedFormat('1v1');
      setMatchType('single');
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
      setBracketSelectedDays([]);
      setBracketSelectedTimes([]);
      setBracketTimeSlots([0, 15, 30, 45]);
    } catch (error) {
      console.error('Error creating bracket:', error);
    }
  };

  const handleCreateBoxBattle = async () => {
    try {
      if (!boxBattleName) {
        alert('Please enter a box battle name');
        return;
      }

      if (!boxBattleStartDate || !boxBattleEndDate) {
        alert('Please select both start and end dates');
        return;
      }

      if (boxBattleSelectedDays.length === 0) {
        alert('Please select at least one day');
        return;
      }

      if (boxBattleSelectedTimes.length === 0) {
        alert('Please select at least one time slot');
        return;
      }

      if (boxBattlePlatform === 'other' && !boxBattleOtherPlatform) {
        alert('Please enter the other platform name');
        return;
      }

      if (boxBattleEntryFeeType !== 'free' && (!boxBattlePaymentMethod || !boxBattlePaymentDueDate || !boxBattlePaymentUsername)) {
        alert('Please fill in all payment details');
        return;
      }

      const availability = boxBattleSelectedDays.map(day => ({
        day: day.toLowerCase(),
        slots: boxBattleSelectedTimes.map(time => {
          const [timeStr, period] = time.split(' ');
          const [hours, minutes] = timeStr.split(':');
          let hour = parseInt(hours);
          if (period === 'PM' && hour !== 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, '0')}:${minutes}`;
        })
      }));

      const boxBattleData = {
        type: 'box_battle',
        name: boxBattleName,
        platform: boxBattlePlatform === 'other' ? boxBattleOtherPlatform : boxBattlePlatform,
        creatorId: currentUser.uid,
        creatorName: currentUser.displayName,
        participants: [currentUser.uid],
        status: 'open',
        createdAt: Timestamp.now(),
        startDate: Timestamp.fromDate(boxBattleStartDate),
        endDate: Timestamp.fromDate(boxBattleEndDate),
        maxPlayers: participantCount,
        description: boxBattleDescription,
        availability,
        prize: {
          type: boxBattlePrizeType,
          amount: boxBattlePrizeType !== 'none' ? boxBattlePrizeAmount : 0
        },
        entryFee: {
          type: boxBattleEntryFeeType,
          amount: boxBattleEntryFeeType !== 'free' ? boxBattleEntryFeeAmount : 0,
          paymentMethod: boxBattleEntryFeeType !== 'free' ? boxBattlePaymentMethod : null,
          dueDate: boxBattleEntryFeeType !== 'free' ? Timestamp.fromDate(boxBattlePaymentDueDate) : null,
          destinationUsername: boxBattleEntryFeeType !== 'free' ? boxBattlePaymentUsername : null
        }
      };

      await addDoc(collection(db, 'matches'), boxBattleData);

      // Reset form
      setBoxBattleName('');
      setBoxBattlePlatform('TikTok');
      setBoxBattleOtherPlatform('');
      setParticipantCount(9);
      setBoxBattleDescription('');
      setBoxBattlePrizeType('none');
      setBoxBattlePrizeAmount(0);
      setBoxBattleEntryFeeType('free');
      setBoxBattleEntryFeeAmount(0);
      setBoxBattlePaymentMethod('');
      setBoxBattlePaymentDueDate(null);
      setBoxBattlePaymentUsername('');
      setBoxBattleStartDate(null);
      setBoxBattleEndDate(null);
      setBoxBattleSelectedDays([]);
      setBoxBattleSelectedTimes([]);
      setBoxBattleTimeSlots([0, 15, 30, 45]);
    } catch (error) {
      console.error('Error creating box battle:', error);
    }
  };

  // Add this useEffect for weekly events
  useEffect(() => {
    const fetchWeeklyEvents = async () => {
      const events = await generateWeeklyEvents();
      setWeeklyEvents(events);
    };
    fetchWeeklyEvents();
  }, []);

  // Add this function for handling drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(compatibleUsers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCompatibleUsers(items);
  };

  // Add this function for manual pairing
  const handleManualPair = async () => {
    if (selectedUsers.length !== 2) {
      alert('Please select exactly 2 users to pair');
      return;
    }

    const success = await manualPairCreators(
      selectedUsers[0].id,
      selectedUsers[1].id,
      selectedMatchType,
      {
        platform: selectedPlatform,
        format: selectedFormat,
        timezone: userTimezone
      }
    );

    if (success) {
      setSelectedUsers([]);
      setShowManualPairing(false);
      alert('Users paired successfully!');
    }
  };

  // Add this function to handle joining weekly brackets
  const handleJoinBracket = async (bracketId) => {
    try {
      const bracketRef = doc(db, 'matches', bracketId);
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

      // If auto-pairing is enabled, try to find a match
      if (bracketData.autoPairing) {
        const pairs = await autoPairCreators(bracketData.type, {
          platform: bracketData.platform,
          format: bracketData.format,
          timezone: userTimezone
        });

        if (pairs.length > 0) {
          alert('Found a match! Check your matches section.');
        }
      }

      alert('Successfully joined the bracket!');
    } catch (error) {
      console.error('Error joining bracket:', error);
      alert('Failed to join bracket. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={responsiveStyles.container}>
        <Box sx={{ mb: isMobile ? 2 : 4 }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
            LIVE Matchmaking
          </Typography>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            sx={responsiveStyles.tabs}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            <Tab label="Set Availability" />
            <Tab label="Find Matches" />
            <Tab label="Create Matches" />
            <Tab label="Create Bracket" />
            <Tab label="Create Box Battle" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={responsiveStyles.gridContainer.spacing}>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                    Set Your Availability
                  </Typography>
                  <FormControl sx={responsiveStyles.formControl}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={userTimezone}
                      onChange={handleTimezoneChange}
                      label="Timezone"
                    >
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: isMobile ? 1 : 2 }}>
                    {Object.entries(availability).map(([day, data]) => (
                      <Box key={day} sx={{ mb: isMobile ? 1 : 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={data.available}
                              onChange={() => handleDayToggle(day)}
                              size={isMobile ? 'small' : 'medium'}
                            />
                          }
                          label={day.charAt(0).toUpperCase() + day.slice(1)}
                        />
                        {data.available && renderAvailabilitySlots(day)}
                      </Box>
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    sx={responsiveStyles.button}
                    onClick={handleAvailabilitySubmit}
                  >
                    Save Availability
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={responsiveStyles.gridContainer.spacing}>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                      Find Matches
                    </Typography>
                    <Tabs
                      value={selectedMatchType}
                      onChange={(e, newValue) => setSelectedMatchType(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      <Tab label="Upcoming" value="upcoming" />
                      <Tab label="Ongoing" value="ongoing" />
                      <Tab label="Completed" value="completed" />
                    </Tabs>
                  </Box>
                  <FormGroup>
                    {matchFormats.map(format => (
                      <FormControlLabel
                        key={format.id}
                        control={
                          <Checkbox
                            size={isMobile ? 'small' : 'medium'}
                            checked={selectedFormats.includes(format.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFormats([...selectedFormats, format.id]);
                              } else {
                                setSelectedFormats(selectedFormats.filter(f => f !== format.id));
                              }
                            }}
                          />
                        }
                        label={format.name}
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                    Weekly Events
                  </Typography>
                  <Grid container spacing={2}>
                    {weeklyBrackets.map((bracket) => (
                      <Grid item xs={12} sm={6} key={bracket.id}>
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
                                label={`${bracket.participants.length}/${bracket.maxPlayers} Players`}
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label={bracket.type === 'bracket' ? 'Bracket' : 'Box Battle'}
                                color="secondary"
                                sx={{ mr: 1 }}
                              />
                              <Chip
                                label="Auto-Pairing"
                                color="success"
                              />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2">
                                Starts: {new Date(bracket.startDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                Ends: {new Date(bracket.endDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ mt: 2 }}
                              onClick={() => handleJoinBracket(bracket.id)}
                            >
                              Join Event
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item {...responsiveStyles.gridItem}>
              <Card sx={responsiveStyles.matchCard}>
                <CardContent>
                  {showManualPairing ? (
                    <Box>
                      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                        Manual Pairing
                      </Typography>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="compatibleUsers">
                          {(provided) => (
                            <List {...provided.droppableProps} ref={provided.innerRef}>
                              {compatibleUsers.map((user, index) => (
                                <Draggable key={user.id} draggableId={user.id} index={index}>
                                  {(provided) => (
                                    <ListItem
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      button
                                      onClick={() => {
                                        if (selectedUsers.length < 2) {
                                          setSelectedUsers([...selectedUsers, user]);
                                        }
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar 
                                          src={user.photoURL} 
                                          sx={responsiveStyles.avatar}
                                        />
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={user.displayName}
                                        secondary={`${user.platform} • ${user.preferredFormat}`}
                                      />
                                    </ListItem>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </List>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <Button
                        variant="contained"
                        sx={responsiveStyles.button}
                        onClick={handleManualPair}
                        disabled={selectedUsers.length !== 2}
                      >
                        Pair Selected Users
                      </Button>
                    </Box>
                  ) : (
                    <>
                      {suggestedMatches.length > 0 ? (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: isMobile ? 1 : 2 }}>
                            <Avatar
                              src={suggestedMatches[0].creatorPhotoURL}
                              sx={responsiveStyles.avatar}
                            />
                          </Box>
                          <Typography 
                            variant={isMobile ? 'h6' : 'h5'} 
                            align="center" 
                            gutterBottom
                          >
                            {suggestedMatches[0].creatorName}
                          </Typography>
                          <Typography 
                            variant={isMobile ? 'body2' : 'body1'} 
                            color="text.secondary" 
                            align="center" 
                            gutterBottom
                          >
                            {suggestedMatches[0].format} • {suggestedMatches[0].platform}
                          </Typography>
                          <Box sx={{ mt: isMobile ? 1 : 2 }}>
                            <Typography variant={isMobile ? 'body2' : 'subtitle2'} gutterBottom>
                              Matching Availability:
                            </Typography>
                            {suggestedMatches[0].matchingSlots.map((slot, index) => (
                              <Chip
                                key={index}
                                label={`${slot.day} ${slot.time}`}
                                sx={responsiveStyles.chip}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            ))}
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: isMobile ? 1 : 2, 
                            mt: isMobile ? 2 : 4 
                          }}>
                            <IconButton
                              color="error"
                              size={isMobile ? 'medium' : 'large'}
                              onClick={() => handleSwipe('left')}
                            >
                              <ThumbDownIcon fontSize={isMobile ? 'medium' : 'large'} />
                            </IconButton>
                            <IconButton
                              color="success"
                              size={isMobile ? 'medium' : 'large'}
                              onClick={() => handleSwipe('right')}
                            >
                              <ThumbUpIcon fontSize={isMobile ? 'medium' : 'large'} />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <Typography 
                          variant={isMobile ? 'body2' : 'body1'} 
                          align="center"
                        >
                          No more matches found. Try adjusting your preferences or check back later.
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={responsiveStyles.gridContainer.spacing}>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                    Create Matches
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Match Format</InputLabel>
                        <Select
                          value={selectedFormat}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          label="Match Format"
                        >
                          {matchFormats.map(format => (
                            <MenuItem key={format.id} value={format.id}>
                              {format.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Platform</InputLabel>
                        <Select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          label="Platform"
                        >
                          <MenuItem value="TikTok">TikTok</MenuItem>
                          <MenuItem value="Bigo">Bigo</MenuItem>
                          <MenuItem value="LIVE.ME">LIVE.ME</MenuItem>
                          <MenuItem value="Mango">Mango</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {selectedPlatform === 'other' && (
                      <Grid item xs={12}>
                        <TextField
                          sx={responsiveStyles.formControl}
                          label="Other Platform Name"
                          value={otherPlatform}
                          onChange={(e) => setOtherPlatform(e.target.value)}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Number of Matches"
                        type="number"
                        value={numberOfMatches}
                        onChange={(e) => setNumberOfMatches(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Select Days</InputLabel>
                        <Select
                          multiple
                          value={selectedDays}
                          onChange={(e) => setSelectedDays(e.target.value)}
                          label="Select Days"
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <MenuItem key={day} value={day}>
                              <Checkbox checked={selectedDays.indexOf(day) > -1} />
                              <ListItemText primary={day} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Select Times</InputLabel>
                        <Select
                          multiple
                          value={selectedTimes}
                          onChange={(e) => setSelectedTimes(e.target.value)}
                          label="Select Times"
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i;
                            return [
                              formatTime12Hour(hour, 0),
                              formatTime12Hour(hour, 15),
                              formatTime12Hour(hour, 30),
                              formatTime12Hour(hour, 45)
                            ];
                          }).flat().map((time) => (
                            <MenuItem key={time} value={time}>
                              <Checkbox checked={selectedTimes.indexOf(time) > -1} />
                              <ListItemText primary={time} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
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
                      <Typography variant={isMobile ? 'body2' : 'subtitle2'} color="text.secondary" gutterBottom>
                        Creator: {currentUser?.displayName || 'Loading...'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        sx={responsiveStyles.button}
                        onClick={handleCreateMatches}
                      >
                        Create Matches
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={responsiveStyles.gridContainer.spacing}>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                    Create Bracket
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Bracket Name"
                        value={bracketName}
                        onChange={(e) => setBracketName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
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
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Match Type</InputLabel>
                        <Select
                          value={matchType}
                          onChange={(e) => setMatchType(e.target.value)}
                          label="Match Type"
                        >
                          <MenuItem value="single">1 and Done</MenuItem>
                          <MenuItem value="bo3">Best of 3</MenuItem>
                          <MenuItem value="bo5">Best of 5</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Platform</InputLabel>
                        <Select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          label="Platform"
                        >
                          <MenuItem value="TikTok">TikTok</MenuItem>
                          <MenuItem value="Bigo">Bigo</MenuItem>
                          <MenuItem value="LIVE.ME">LIVE.ME</MenuItem>
                          <MenuItem value="Mango">Mango</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {selectedPlatform === 'other' && (
                      <Grid item xs={12}>
                        <TextField
                          sx={responsiveStyles.formControl}
                          label="Other Platform Name"
                          value={otherPlatform}
                          onChange={(e) => setOtherPlatform(e.target.value)}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Max Players"
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Math.min(500, Math.max(2, parseInt(e.target.value) || 2)))}
                        inputProps={{ min: 2, max: 500 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="Start Date"
                        value={bracketStartDate}
                        onChange={(newValue) => setBracketStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="End Date"
                        value={bracketEndDate}
                        onChange={(newValue) => setBracketEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Select Days</InputLabel>
                        <Select
                          multiple
                          value={bracketSelectedDays}
                          onChange={(e) => setBracketSelectedDays(e.target.value)}
                          label="Select Days"
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <MenuItem key={day} value={day}>
                              <Checkbox checked={bracketSelectedDays.indexOf(day) > -1} />
                              <ListItemText primary={day} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bracketUse12Hour}
                            onChange={(e) => setBracketUse12Hour(e.target.checked)}
                          />
                        }
                        label="Use 12-hour format"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
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
                      <FormControl sx={responsiveStyles.formControl}>
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
                      <Typography variant="subtitle1" gutterBottom>
                        Manual Pairing
                      </Typography>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="compatibleUsers">
                          {(provided) => (
                            <List {...provided.droppableProps} ref={provided.innerRef}>
                              {compatibleUsers.map((user, index) => (
                                <Draggable key={user.id} draggableId={user.id} index={index}>
                                  {(provided) => (
                                    <ListItem
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      button
                                      onClick={() => {
                                        if (selectedUsers.length < 2) {
                                          setSelectedUsers([...selectedUsers, user]);
                                        }
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar src={user.photoURL} />
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={user.displayName}
                                        secondary={`${user.platform} • ${user.preferredFormat}`}
                                      />
                                    </ListItem>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </List>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleManualPair}
                        disabled={selectedUsers.length !== 2}
                        sx={responsiveStyles.button}
                      >
                        Pair Selected Users
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant={isMobile ? 'body2' : 'subtitle2'} color="text.secondary" gutterBottom>
                        Creator: {currentUser?.displayName || 'Loading...'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        sx={responsiveStyles.button}
                        onClick={handleCreateBracket}
                      >
                        Create Bracket
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={responsiveStyles.gridContainer.spacing}>
            <Grid item xs={12}>
              <Card sx={responsiveStyles.card}>
                <CardContent>
                  <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
                    Create Box Battle
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Box Battle Name"
                        value={boxBattleName}
                        onChange={(e) => setBoxBattleName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Platform</InputLabel>
                        <Select
                          value={boxBattlePlatform}
                          onChange={(e) => setBoxBattlePlatform(e.target.value)}
                          label="Platform"
                        >
                          <MenuItem value="TikTok">TikTok</MenuItem>
                          <MenuItem value="Bigo">Bigo</MenuItem>
                          <MenuItem value="LIVE.ME">LIVE.ME</MenuItem>
                          <MenuItem value="Mango">Mango</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {boxBattlePlatform === 'other' && (
                      <Grid item xs={12}>
                        <TextField
                          sx={responsiveStyles.formControl}
                          label="Other Platform Name"
                          value={boxBattleOtherPlatform}
                          onChange={(e) => setBoxBattleOtherPlatform(e.target.value)}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Number of Participants"
                        type="number"
                        value={participantCount}
                        onChange={(e) => setParticipantCount(Math.min(100, Math.max(2, parseInt(e.target.value) || 2)))}
                        inputProps={{ min: 2, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        sx={responsiveStyles.formControl}
                        label="Description"
                        multiline
                        rows={4}
                        value={boxBattleDescription}
                        onChange={(e) => setBoxBattleDescription(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="Start Date"
                        value={boxBattleStartDate}
                        onChange={(newValue) => setBoxBattleStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        sx={responsiveStyles.formControl}
                        label="End Date"
                        value={boxBattleEndDate}
                        onChange={(newValue) => setBoxBattleEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Select Days</InputLabel>
                        <Select
                          multiple
                          value={boxBattleSelectedDays}
                          onChange={(e) => setBoxBattleSelectedDays(e.target.value)}
                          label="Select Days"
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <MenuItem key={day} value={day}>
                              <Checkbox checked={boxBattleSelectedDays.indexOf(day) > -1} />
                              <ListItemText primary={day} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={boxBattleUse12Hour}
                            onChange={(e) => setBoxBattleUse12Hour(e.target.checked)}
                          />
                        }
                        label="Use 12-hour format"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Time Slots</InputLabel>
                        <Select
                          multiple
                          value={boxBattleTimeSlots}
                          onChange={(e) => setBoxBattleTimeSlots(e.target.value)}
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
                      <FormControl sx={responsiveStyles.formControl}>
                        <InputLabel>Select Times</InputLabel>
                        <Select
                          multiple
                          value={boxBattleSelectedTimes}
                          onChange={(e) => setBoxBattleSelectedTimes(e.target.value)}
                          label="Select Times"
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {Array.from({ length: 24 }, (_, hour) => 
                            boxBattleTimeSlots.map(minute => formatTimeSlot(hour, minute, boxBattleUse12Hour))
                          ).flat().map((time) => (
                            <MenuItem key={time} value={time}>
                              <Checkbox checked={boxBattleSelectedTimes.indexOf(time) > -1} />
                              <ListItemText primary={time} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
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
                      <Typography variant="subtitle1" gutterBottom>
                        Manual Pairing
                      </Typography>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="compatibleUsers">
                          {(provided) => (
                            <List {...provided.droppableProps} ref={provided.innerRef}>
                              {compatibleUsers.map((user, index) => (
                                <Draggable key={user.id} draggableId={user.id} index={index}>
                                  {(provided) => (
                                    <ListItem
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      button
                                      onClick={() => {
                                        if (selectedUsers.length < 2) {
                                          setSelectedUsers([...selectedUsers, user]);
                                        }
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar src={user.photoURL} />
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={user.displayName}
                                        secondary={`${user.platform} • ${user.preferredFormat}`}
                                      />
                                    </ListItem>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </List>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleManualPair}
                        disabled={selectedUsers.length !== 2}
                        sx={responsiveStyles.button}
                      >
                        Pair Selected Users
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant={isMobile ? 'body2' : 'subtitle2'} color="text.secondary" gutterBottom>
                        Creator: {currentUser?.displayName || 'Loading...'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        sx={responsiveStyles.button}
                        onClick={handleCreateBoxBattle}
                      >
                        Create Box Battle
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default Matchmaking; 