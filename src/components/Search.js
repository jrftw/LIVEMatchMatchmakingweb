import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
  Sports as SportsIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    networks: [],
    tournaments: [],
    matches: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        setSearchResults({
          users: [],
          networks: [],
          tournaments: [],
          matches: [],
        });
        return;
      }

      setIsLoading(true);
      try {
        // Search users
        const usersQuery = query(
          collection(db, 'users'),
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff'),
          limit(5)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Search networks
        const networksQuery = query(
          collection(db, 'networks'),
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff'),
          limit(5)
        );
        const networksSnapshot = await getDocs(networksQuery);
        const networks = networksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Search tournaments
        const tournamentsQuery = query(
          collection(db, 'tournaments'),
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff'),
          limit(5)
        );
        const tournamentsSnapshot = await getDocs(tournamentsQuery);
        const tournaments = tournamentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Search matches
        const matchesQuery = query(
          collection(db, 'matches'),
          where('title', '>=', searchTerm),
          where('title', '<=', searchTerm + '\uf8ff'),
          limit(5)
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matches = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSearchResults({
          users,
          networks,
          tournaments,
          matches,
        });
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults({
      users: [],
      networks: [],
      tournaments: [],
      matches: [],
    });
  };

  const handleItemClick = (type, id) => {
    switch (type) {
      case 'user':
        navigate(`/profile/${id}`);
        break;
      case 'network':
        navigate(`/creator-network/${id}`);
        break;
      case 'tournament':
        navigate(`/tournaments/${id}`);
        break;
      case 'match':
        navigate(`/matches/${id}`);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users, networks, tournaments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {searchTerm && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {searchResults.users.length > 0 && (
                <>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Users
                    </Typography>
                    <List>
                      {searchResults.users.map((user) => (
                        <ListItem
                          key={user.id}
                          button
                          onClick={() => handleItemClick('user', user.id)}
                        >
                          <ListItemAvatar>
                            <Avatar src={user.photoURL}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.displayName}
                            secondary={user.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                </>
              )}

              {searchResults.networks.length > 0 && (
                <>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Networks
                    </Typography>
                    <List>
                      {searchResults.networks.map((network) => (
                        <ListItem
                          key={network.id}
                          button
                          onClick={() => handleItemClick('network', network.id)}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <GroupIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={network.name}
                            secondary={`${network.memberCount || 0} members`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                </>
              )}

              {searchResults.tournaments.length > 0 && (
                <>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tournaments
                    </Typography>
                    <List>
                      {searchResults.tournaments.map((tournament) => (
                        <ListItem
                          key={tournament.id}
                          button
                          onClick={() => handleItemClick('tournament', tournament.id)}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <EmojiEventsIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={tournament.name}
                            secondary={`${tournament.participantCount || 0} participants`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                </>
              )}

              {searchResults.matches.length > 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Matches
                  </Typography>
                  <List>
                    {searchResults.matches.map((match) => (
                      <ListItem
                        key={match.id}
                        button
                        onClick={() => handleItemClick('match', match.id)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <SportsIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={match.title}
                          secondary={new Date(match.date?.toDate()).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {Object.values(searchResults).every(arr => arr.length === 0) && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default Search; 