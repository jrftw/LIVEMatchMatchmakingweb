import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Link as LinkIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Favorite as FavoriteIcon,
  LiveTv as LiveTvIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  SportsEsports as SportsEsportsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { query, getDocs, where, collection } from 'firebase/firestore';

function Profile() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const profileImageInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    nickname: '',
    username: '',
    bio: '',
    bannerImage: '',
    profileImage: '',
    platforms: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      favorited: '',
    },
    links: [],
    stats: {
      followers: 0,
      following: 0,
      matches: 0,
      tournaments: 0,
      posts: 0,
    },
    isFollowing: false,
  });

  const [editForm, setEditForm] = useState({
    nickname: '',
    username: '',
    bio: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    platforms: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      favorited: '',
    },
    links: [{ name: '', url: '' }],
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // First try to find user by username
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', identifier)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        let userData;
        
        if (!usersSnapshot.empty) {
          // Found by username
          userData = usersSnapshot.docs[0].data();
        } else {
          // Try to find by ID
          const userDoc = await getDoc(doc(db, 'users', identifier));
          if (!userDoc.exists()) {
            navigate('/404');
            return;
          }
          userData = userDoc.data();
        }

        // Ensure platforms object exists with default values
        const platforms = userData.platforms || {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          favorited: '',
        };

        // Ensure links array exists
        const links = Array.isArray(userData.links) ? userData.links : [];

        setProfileData({
          ...userData,
          platforms,
          links,
          stats: userData.stats || {
            followers: 0,
            following: 0,
            matches: 0,
            tournaments: 0,
            posts: 0,
          },
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [identifier, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFollow = () => {
    setProfileData(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      stats: {
        ...prev.stats,
        followers: prev.isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1,
      },
    }));
  };

  const handleEditClick = () => {
    setEditForm({
      nickname: profileData.nickname,
      username: profileData.username,
      bio: profileData.bio,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || '',
      dateOfBirth: profileData.dateOfBirth || '',
      gender: profileData.gender || '',
      location: profileData.location || '',
      platforms: { ...profileData.platforms },
      links: [...profileData.links],
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        nickname: editForm.nickname,
        username: editForm.username,
        bio: editForm.bio,
        phoneNumber: editForm.phoneNumber,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        location: editForm.location,
        platforms: editForm.platforms,
        links: editForm.links,
        updatedAt: new Date().toISOString(),
      });

      setProfileData(prev => ({
        ...prev,
        nickname: editForm.nickname,
        username: editForm.username,
        bio: editForm.bio,
        phoneNumber: editForm.phoneNumber,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        location: editForm.location,
        platforms: editForm.platforms,
        links: editForm.links,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddLink = () => {
    setEditForm(prev => ({
      ...prev,
      links: [...prev.links, { name: '', url: '' }],
    }));
  };

  const handleRemoveLink = (index) => {
    setEditForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleLinkChange = (index, field, value) => {
    setEditForm(prev => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !currentUser) return;
    
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `users/${currentUser.uid}/${type}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        [type === 'profile' ? 'profileImage' : 'bannerImage']: downloadURL
      });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        [type === 'profile' ? 'profileImage' : 'bannerImage']: downloadURL
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isOwnProfile = currentUser?.uid === identifier || currentUser?.username === identifier;

  return (
    <Container maxWidth="lg">
      {/* Banner and Profile Section */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <input
          type="file"
          accept="image/*"
          ref={bannerImageInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
        />
        {profileData.bannerImage ? (
          <Box
            component="img"
            src={profileData.bannerImage}
            alt="Banner"
            sx={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
              borderRadius: 2,
              cursor: 'pointer',
            }}
            onClick={() => bannerImageInputRef.current?.click()}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 300,
              bgcolor: 'grey.200',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => bannerImageInputRef.current?.click()}
          >
            <Typography variant="body1" color="text.secondary">
              Click to upload banner image
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: 20,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <input
            type="file"
            accept="image/*"
            ref={profileImageInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
          />
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profileData.profileImage}
              alt={profileData.nickname}
              sx={{
                width: 160,
                height: 160,
                border: '4px solid',
                borderColor: 'background.paper',
                cursor: 'pointer',
              }}
              onClick={() => profileImageInputRef.current?.click()}
            />
            {isUploading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
          <Box sx={{ mb: 2 }}>
            {profileData.nickname && (
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {profileData.nickname}
              </Typography>
            )}
            {profileData.username && (
              <Typography variant="subtitle1" color="text.secondary">
                @{profileData.username}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 8 }}>
        {isOwnProfile ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="contained"
            color={profileData.isFollowing ? 'secondary' : 'primary'}
            onClick={handleFollow}
          >
            {profileData.isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </Box>

      {/* Bio and Stats */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body1" paragraph>
              {profileData.bio}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(profileData.platforms).map(([platform, username]) => (
                <Chip
                  key={platform}
                  icon={
                    platform === 'facebook' ? <FacebookIcon /> :
                    platform === 'twitter' ? <TwitterIcon /> :
                    platform === 'instagram' ? <InstagramIcon /> :
                    platform === 'tiktok' ? <IconButton color="primary">
                      <YouTubeIcon />
                    </IconButton> :
                    platform === 'favorited' ? <FavoriteIcon /> :
                    <LiveTvIcon />
                  }
                  label={`${platform}: ${username}`}
                  variant="outlined"
                />
              ))}
            </Box>
            <Box sx={{ mt: 2 }}>
              {profileData.links.map((link, index) => (
                <Button
                  key={index}
                  startIcon={<LinkIcon />}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mr: 1, mb: 1 }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stats
            </Typography>
            <List>
              <ListItem button onClick={() => navigate(`/profile/${identifier}/followers`)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={profileData.stats.followers.toLocaleString()}
                  secondary="Followers"
                />
              </ListItem>
              <ListItem button onClick={() => navigate(`/profile/${identifier}/following`)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={profileData.stats.following.toLocaleString()}
                  secondary="Following"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SportsEsportsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={profileData.stats.matches.toLocaleString()}
                  secondary="Matches"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmojiEventsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={profileData.stats.tournaments.toLocaleString()}
                  secondary="Tournaments"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FavoriteIcon />
                </ListItemIcon>
                <ListItemText
                  primary={profileData.stats.posts.toLocaleString()}
                  secondary="Posts"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Content Tabs */}
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Posts" />
          <Tab label="Matches" />
          <Tab label="Tournaments" />
          <Tab label="Media" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <Typography>Posts content will go here</Typography>}
          {activeTab === 1 && <Typography>Matches content will go here</Typography>}
          {activeTab === 2 && <Typography>Tournaments content will go here</Typography>}
          {activeTab === 3 && <Typography>Media content will go here</Typography>}
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nickname"
                value={editForm.nickname}
                onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.email}
                disabled
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                value={editForm.gender}
                onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Social Media
              </Typography>
              {Object.entries(editForm.platforms).map(([platform, username]) => (
                <Grid item xs={12} sm={6} key={platform}>
                  <TextField
                    fullWidth
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={username}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      platforms: { ...prev.platforms, [platform]: e.target.value }
                    }))}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Links
              </Typography>
              {editForm.links.map((link, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Link Name"
                      value={link.name}
                      onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="URL"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    />
                    <IconButton onClick={() => handleRemoveLink(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
              <Button onClick={handleAddLink} sx={{ mt: 1 }}>
                Add Link
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile; 