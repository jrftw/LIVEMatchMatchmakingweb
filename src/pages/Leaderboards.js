import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

function Leaderboards() {
  const [tabValue, setTabValue] = useState(0);
  const [leaderboards, setLeaderboards] = useState({
    points: [],
    matches: [],
    tournaments: [],
  });

  useEffect(() => {
    fetchLeaderboards();
  }, [tabValue]);

  const fetchLeaderboards = async () => {
    const usersRef = collection(db, 'users');
    let q;

    switch (tabValue) {
      case 0:
        q = query(usersRef, orderBy('points', 'desc'), limit(10));
        break;
      case 1:
        q = query(usersRef, orderBy('matchesWon', 'desc'), limit(10));
        break;
      case 2:
        q = query(usersRef, orderBy('tournamentsWon', 'desc'), limit(10));
        break;
      default:
        return;
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setLeaderboards(prev => ({
      ...prev,
      [['points', 'matches', 'tournaments'][tabValue]]: data
    }));
  };

  const getCurrentLeaderboard = () => {
    switch (tabValue) {
      case 0:
        return leaderboards.points;
      case 1:
        return leaderboards.matches;
      case 2:
        return leaderboards.tournaments;
      default:
        return [];
    }
  };

  const getColumnTitle = () => {
    switch (tabValue) {
      case 0:
        return 'Points';
      case 1:
        return 'Matches Won';
      case 2:
        return 'Tournaments Won';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Leaderboards
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 4 }}
        >
          <Tab label="Points" />
          <Tab label="Matches" />
          <Tab label="Tournaments" />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">{getColumnTitle()}</TableCell>
                <TableCell align="right">Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentLeaderboard().map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={user.photoURL} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1">
                          {user.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {tabValue === 0 && user.points}
                    {tabValue === 1 && user.matchesWon}
                    {tabValue === 2 && user.tournamentsWon}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`Level ${user.level || 1}`}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default Leaderboards; 