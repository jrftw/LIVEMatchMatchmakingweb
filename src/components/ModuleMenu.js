import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon,
  Article as ArticleIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  SportsEsports as SportsEsportsIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { text: 'LIVE Matchmaking', icon: <PeopleIcon />, path: '/matchmaking' },
  { text: 'Gaming', icon: <SportsEsportsIcon />, path: '/gaming' },
  { text: 'My Events', icon: <EventIcon />, path: '/my-events' },
  { text: 'Achievements', icon: <EmojiEventsIcon />, path: '/achievements' },
  { text: 'Leaderboards', icon: <LeaderboardIcon />, path: '/leaderboards' },
  { text: 'News', icon: <ArticleIcon />, path: '/news' },
  { text: 'Help', icon: <HelpIcon />, path: '/help' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function ModuleMenu() {
  const location = useLocation();

  return (
    <Box sx={{ width: 250, bgcolor: 'background.paper' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ModuleMenu; 