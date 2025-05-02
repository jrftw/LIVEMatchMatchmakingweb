import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Paper,
} from '@mui/material';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

const achievements = [
  // Daily Login Achievements
  {
    id: 'daily_login',
    title: 'Daily Login',
    description: 'Log in to the platform today',
    points: 5,
    icon: '📅',
    category: 'daily',
    requirement: 1,
    track: (userData) => userData.lastLogin ? 1 : 0
  },
  {
    id: 'login_streak_3',
    title: '3-Day Login Streak',
    description: 'Log in for 3 consecutive days',
    points: 15,
    icon: '🔥',
    category: 'daily',
    requirement: 3,
    track: (userData) => userData.dailyStreak || 0
  },
  {
    id: 'login_streak_7',
    title: '7-Day Login Streak',
    description: 'Log in for 7 consecutive days',
    points: 35,
    icon: '🔥🔥',
    category: 'daily',
    requirement: 7,
    track: (userData) => userData.dailyStreak || 0
  },
  {
    id: 'login_streak_14',
    title: '14-Day Login Streak',
    description: 'Log in for 14 consecutive days',
    points: 70,
    icon: '🔥🔥🔥',
    category: 'daily',
    requirement: 14,
    track: (userData) => userData.dailyStreak || 0
  },
  {
    id: 'login_streak_30',
    title: '30-Day Login Streak',
    description: 'Log in for 30 consecutive days',
    points: 150,
    icon: '🔥🔥🔥🔥',
    category: 'daily',
    requirement: 30,
    track: (userData) => userData.dailyStreak || 0
  },

  // Match Participation Achievements
  {
    id: 'match_participant_10',
    title: 'Match Enthusiast',
    description: 'Participate in 10 matches',
    points: 100,
    icon: '🎮',
    category: 'matches',
    requirement: 10,
    track: (userData) => userData.matchesParticipated || 0
  },
  {
    id: 'match_participant_50',
    title: 'Match Veteran',
    description: 'Participate in 50 matches',
    points: 500,
    icon: '🎮🎮',
    category: 'matches',
    requirement: 50,
    track: (userData) => userData.matchesParticipated || 0
  },
  {
    id: 'match_participant_100',
    title: 'Match Master',
    description: 'Participate in 100 matches',
    points: 1000,
    icon: '🎮🎮🎮',
    category: 'matches',
    requirement: 100,
    track: (userData) => userData.matchesParticipated || 0
  },

  // Match Creation Achievements
  {
    id: 'match_creator_5',
    title: 'Match Organizer',
    description: 'Create 5 matches',
    points: 200,
    icon: '📋',
    category: 'creation',
    requirement: 5,
    track: (userData) => userData.matchesCreated || 0
  },
  {
    id: 'match_creator_20',
    title: 'Match Producer',
    description: 'Create 20 matches',
    points: 800,
    icon: '📋📋',
    category: 'creation',
    requirement: 20,
    track: (userData) => userData.matchesCreated || 0
  },

  // Tournament Achievements
  {
    id: 'tournament_participant_3',
    title: 'Tournament Regular',
    description: 'Join 3 tournaments',
    points: 150,
    icon: '🏆',
    category: 'tournaments',
    requirement: 3,
    track: (userData) => userData.tournamentsJoined || 0
  },
  {
    id: 'tournament_creator_2',
    title: 'Tournament Host',
    description: 'Create 2 tournaments',
    points: 300,
    icon: '🎪',
    category: 'tournaments',
    requirement: 2,
    track: (userData) => userData.tournamentsCreated || 0
  },

  // Availability Achievements
  {
    id: 'availability_setter',
    title: 'Schedule Master',
    description: 'Set your availability for 7 days',
    points: 100,
    icon: '📅',
    category: 'availability',
    requirement: 7,
    track: (userData) => userData.availabilityDaysSet || 0
  },
  {
    id: 'availability_consistency',
    title: 'Consistent Schedule',
    description: 'Maintain availability for 30 days',
    points: 300,
    icon: '📅📅',
    category: 'availability',
    requirement: 30,
    track: (userData) => userData.availabilityDaysMaintained || 0
  },

  // Platform Specific Achievements
  {
    id: 'platform_tiktok',
    title: 'TikTok Star',
    description: 'Stream 5 matches on TikTok',
    points: 200,
    icon: '📱',
    category: 'platform',
    requirement: 5,
    track: (userData) => userData.tiktokStreams || 0
  },
  {
    id: 'platform_bigo',
    title: 'Bigo Pro',
    description: 'Stream 5 matches on Bigo',
    points: 200,
    icon: '📱',
    category: 'platform',
    requirement: 5,
    track: (userData) => userData.bigoStreams || 0
  },
  {
    id: 'platform_liveme',
    title: 'LIVE.ME Expert',
    description: 'Stream 5 matches on LIVE.ME',
    points: 200,
    icon: '📱',
    category: 'platform',
    requirement: 5,
    track: (userData) => userData.livemeStreams || 0
  },

  // Match Format Achievements
  {
    id: 'format_1v1',
    title: '1v1 Specialist',
    description: 'Play 10 1v1 matches',
    points: 100,
    icon: '⚔️',
    category: 'format',
    requirement: 10,
    track: (userData) => userData.format1v1Matches || 0
  },
  {
    id: 'format_team',
    title: 'Team Player',
    description: 'Play 10 team matches',
    points: 100,
    icon: '👥',
    category: 'format',
    requirement: 10,
    track: (userData) => userData.teamMatches || 0
  },

  // Time-Based Achievements
  {
    id: 'time_morning',
    title: 'Early Bird',
    description: 'Play 5 matches between 6-9 AM',
    points: 100,
    icon: '🌅',
    category: 'time',
    requirement: 5,
    track: (userData) => userData.morningMatches || 0
  },
  {
    id: 'time_evening',
    title: 'Night Owl',
    description: 'Play 5 matches between 9 PM-12 AM',
    points: 100,
    icon: '🌙',
    category: 'time',
    requirement: 5,
    track: (userData) => userData.eveningMatches || 0
  },

  // Special Event Achievements
  {
    id: 'event_participant',
    title: 'Event Enthusiast',
    description: 'Participate in 3 special events',
    points: 200,
    icon: '🎉',
    category: 'events',
    requirement: 3,
    track: (userData) => userData.specialEventsParticipated || 0
  },
  {
    id: 'event_creator',
    title: 'Event Organizer',
    description: 'Create 2 special events',
    points: 300,
    icon: '🎪',
    category: 'events',
    requirement: 2,
    track: (userData) => userData.specialEventsCreated || 0
  },

  // Community Achievements
  {
    id: 'community_connections',
    title: 'Network Builder',
    description: 'Connect with 10 creators',
    points: 200,
    icon: '🤝',
    category: 'community',
    requirement: 10,
    track: (userData) => userData.creatorConnections || 0
  },
  {
    id: 'community_feedback',
    title: 'Community Helper',
    description: 'Provide feedback on 5 matches',
    points: 150,
    icon: '💬',
    category: 'community',
    requirement: 5,
    track: (userData) => userData.matchFeedbackGiven || 0
  },

  // Special Achievement Categories
  {
    id: 'special_early_adopter',
    title: 'Early Adopter',
    description: 'Join the platform in its first 6 months',
    points: 1000,
    icon: '🚀',
    category: 'special',
    requirement: 1,
    track: (userData) => {
      if (!userData.joinDate) return 0;
      const joinDate = userData.joinDate.toDate();
      const sixMonthsLater = new Date(joinDate);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      return new Date() <= sixMonthsLater ? 1 : 0;
    }
  },
  {
    id: 'special_ambassador',
    title: 'Platform Ambassador',
    description: 'Help 5 new creators join the platform',
    points: 500,
    icon: '🎖️',
    category: 'special',
    requirement: 5,
    track: (userData) => userData.creatorsReferred || 0
  }
];

function Achievements() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userAchievements, setUserAchievements] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(user);
        fetchLeaderboard();
        checkDailyLogin(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchUserData = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData) {
        setUserAchievements(userData.achievements || {});
        setUserProgress(userData.progress || {});
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('totalPoints', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const leaderboardData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achievement, userData) => {
    if (!achievement.track) return 0;
    const current = achievement.track(userData);
    return Math.min((current / achievement.requirement) * 100, 100);
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <EmojiEventsIcon color="gold" fontSize="large" />;
      case 2:
        return <MilitaryTechIcon color="silver" fontSize="large" />;
      case 3:
        return <WorkspacePremiumIcon color="bronze" fontSize="large" />;
      default:
        return null;
    }
  };

  const checkDailyLogin = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastLogin = userData.lastLogin ? new Date(userData.lastLogin.toDate()) : null;
        const lastLoginDate = lastLogin ? new Date(lastLogin.setHours(0, 0, 0, 0)) : null;
        
        // Check if it's a new day
        if (!lastLoginDate || lastLoginDate.getTime() !== today.getTime()) {
          // Update streak
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          let newStreak = 1;
          if (lastLoginDate && lastLoginDate.getTime() === yesterday.getTime()) {
            newStreak = (userData.dailyStreak || 0) + 1;
          }
          
          // Update best streak if needed
          const newBestStreak = Math.max(newStreak, userData.bestStreak || 0);
          
          // Update user document
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: Timestamp.now(),
            dailyStreak: newStreak,
            bestStreak: newBestStreak
          });
          
          setDailyStreak(newStreak);
          setBestStreak(newBestStreak);
          setLastLoginDate(today);
          
          // Award daily login achievement
          await awardAchievement(user.uid, 'daily_login');
        } else {
          setDailyStreak(userData.dailyStreak || 0);
          setBestStreak(userData.bestStreak || 0);
          setLastLoginDate(lastLoginDate);
        }
      }
    } catch (error) {
      console.error('Error checking daily login:', error);
    }
  };

  const awardAchievement = async (userId, achievementId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (userData && !userData.achievements?.includes(achievementId)) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
          await updateDoc(userRef, {
            achievements: arrayUnion(achievementId),
            points: (userData.points || 0) + achievement.points
          });
        }
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Achievements
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" color="text.secondary">
              Current Streak
            </Typography>
            <Typography variant="h4">
              {dailyStreak} days
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" color="text.secondary">
              Best Streak
            </Typography>
            <Typography variant="h4">
              {bestStreak} days
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 4 }}
      >
        <Tab label="My Achievements" />
        <Tab label="Leaderboard" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {achievements.map((achievement) => {
            const progress = calculateProgress(achievement, userProgress);
            const isUnlocked = userAchievements[achievement.id]?.unlocked || false;

            return (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: isUnlocked ? 'primary.main' : 'grey.300', mr: 2 }}>
                        {achievement.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{achievement.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Progress:
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${progress}%`,
                              height: '100%',
                              bgcolor: isUnlocked ? 'primary.main' : 'grey.400',
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip
                        label={`${userProgress[achievement.category] || 0}/${achievement.requirement}`}
                        size="small"
                      />
                      <Chip
                        label={`${achievement.points} points`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {leaderboard.map((user, index) => (
            <Grid item xs={12} key={user.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 40, textAlign: 'center' }}>
                      {getRankBadge(index + 1) || (
                        <Typography variant="h6">{index + 1}</Typography>
                      )}
                    </Box>
                    <Avatar
                      src={user.photoURL}
                      alt={user.displayName}
                      sx={{ width: 56, height: 56, mx: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{user.displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        {user.totalPoints || 0} pts
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.achievements?.length || 0} achievements
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Achievements; 