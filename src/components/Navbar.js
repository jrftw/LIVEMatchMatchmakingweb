import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  EmojiEvents as EmojiEventsIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Feed as FeedIcon,
  AccountCircle as AccountCircleIcon,
  Group as GroupIcon,
  SportsEsports as SportsEsportsIcon,
  MilitaryTech as MilitaryTechIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          LIVE Match - Matchmaking
        </Typography>

        {currentUser ? (
          <>
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/matchmaking"
                startIcon={<SportsEsportsIcon />}
              >
                Matchmaking
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/tournaments"
                startIcon={<EmojiEventsIcon />}
              >
                Tournaments
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/creator-network"
                startIcon={<GroupIcon />}
              >
                Networks
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/achievements"
                startIcon={<MilitaryTechIcon />}
              >
                Achievements
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/messages"
                startIcon={<ChatIcon />}
              >
                Messages
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/feed"
                startIcon={<FeedIcon />}
              >
                Feed
              </Button>
            </Box>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {userData?.photoURL ? (
                <Avatar
                  alt={userData.displayName}
                  src={userData.photoURL}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                component={Link}
                to={`/profile/${currentUser.uid}`}
                onClick={handleClose}
              >
                Profile
              </MenuItem>
              <MenuItem
                component={Link}
                to="/settings"
                onClick={handleClose}
              >
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={Link}
              to="/login"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/signup"
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 