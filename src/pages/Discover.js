import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { Favorite, Close, Info } from '@mui/icons-material';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Discover() {
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch current user's data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser(userData);
          
          // Fetch suggested users only if current user has tags
          if (userData.tags && userData.tags.length > 0) {
            const usersRef = collection(db, 'users');
            const q = query(
              usersRef,
              where('tags', 'array-contains-any', userData.tags),
              where('uid', '!=', user.uid) // Exclude current user
            );
            const querySnapshot = await getDocs(q);
            const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSuggestedUsers(users);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSwipe = async (direction) => {
    if (currentIndex >= suggestedUsers.length) return;

    const currentUserId = auth.currentUser?.uid;
    const swipedUserId = suggestedUsers[currentIndex].id;

    if (direction === 'right' && currentUserId) {
      // Add to matches if both users swiped right
      const swipedUserRef = doc(db, 'users', swipedUserId);
      const swipedUserDoc = await getDoc(swipedUserRef);
      const swipedUser = swipedUserDoc.data();

      if (swipedUser.likes?.includes(currentUserId)) {
        // It's a match!
        await updateDoc(doc(db, 'users', currentUserId), {
          matches: arrayUnion(swipedUserId)
        });
        await updateDoc(swipedUserRef, {
          matches: arrayUnion(currentUserId)
        });
      } else {
        // Just a like
        await updateDoc(doc(db, 'users', currentUserId), {
          likes: arrayUnion(swipedUserId)
        });
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (currentIndex >= suggestedUsers.length) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No more suggestions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for new matches!
          </Typography>
        </Paper>
      </Container>
    );
  }

  const currentProfile = suggestedUsers[currentIndex];

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, position: 'relative', height: '80vh' }}>
        <Card {...swipeHandlers} sx={{ height: '100%', position: 'relative' }}>
          <CardMedia
            component="img"
            height="400"
            image={currentProfile.photoURL || '/default-profile.jpg'}
            alt={currentProfile.displayName}
          />
          <CardContent>
            <Typography variant="h5" component="div">
              {currentProfile.displayName}
              <Typography variant="subtitle1" color="text.secondary">
                @{currentProfile.username}
              </Typography>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {currentProfile.bio}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              {currentProfile.tags?.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Platform Usernames:
              </Typography>
              {Object.entries(currentProfile.platformUsernames || {}).map(([platform, username]) => (
                <Chip
                  key={platform}
                  label={`${platform}: ${username}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2
        }}>
          <IconButton
            size="large"
            color="error"
            onClick={() => handleSwipe('left')}
            sx={{ 
              backgroundColor: 'white',
              boxShadow: 3,
              '&:hover': { backgroundColor: '#ffebee' }
            }}
          >
            <Close />
          </IconButton>
          <IconButton
            size="large"
            color="primary"
            onClick={() => handleSwipe('right')}
            sx={{ 
              backgroundColor: 'white',
              boxShadow: 3,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            <Favorite />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}

export default Discover; 