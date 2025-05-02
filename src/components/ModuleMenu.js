import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
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
  Explore as ExploreIcon,
  Groups as GroupsIcon,
  MilitaryTech as MilitaryTechIcon,
  Sports as SportsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import Search from './Search';

const menuItems = [
  { text: 'LIVE Matchmaking', icon: <PeopleIcon />, path: '/matchmaking' },
  { text: 'Gaming', icon: <SportsEsportsIcon />, path: '/gaming' },
  { text: 'Discover', icon: <ExploreIcon />, path: '/discover' },
  { text: 'Tournaments', icon: <EmojiEventsIcon />, path: '/tournaments' },
  { text: 'Networks', icon: <GroupsIcon />, path: '/creator-network' },
  { text: 'Matches', icon: <SportsIcon />, path: '/matches' },
  { text: 'My Events', icon: <EventIcon />, path: '/my-events' },
  { text: 'Achievements', icon: <MilitaryTechIcon />, path: '/achievements' },
  { text: 'Leaderboards', icon: <LeaderboardIcon />, path: '/leaderboards' },
  { text: 'News', icon: <ArticleIcon />, path: '/news' },
  { text: 'Help', icon: <HelpIcon />, path: '/help' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function ModuleMenu() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const mainFeatures = menuItems.slice(0, 6);
  const utilityFeatures = menuItems.slice(6);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuContent = (
    <Box sx={{ width: isMobile ? '100%' : 250, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2 }}>
        <Search />
      </Box>
      <Divider />
      <List>
        {mainFeatures.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
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
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                noWrap: true
              }}
            />
          </ListItem>
        ))}
        <Divider />
        {utilityFeatures.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
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
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                noWrap: true
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed',
            left: 16,
            top: 8,
            zIndex: theme.zIndex.appBar + 1,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.default',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: '80%',
              maxWidth: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          {menuContent}
        </Drawer>
      </>
    );
  }

  return menuContent;
}

export default ModuleMenu; 