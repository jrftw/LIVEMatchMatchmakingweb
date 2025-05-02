import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

const platforms = ['TikTok', 'Favorited', 'Bigo', 'Mango'];
const tags = ['Gaming', 'Music', 'Dance', 'Comedy', 'Art', 'Cooking', 'Fitness', 'Education'];

function SignUp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const profilePicRef = useRef(null);
  const bannerPicRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    birthday: null,
    phone: '',
    clanTag: '',
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [platformUsernames, setPlatformUsernames] = useState({});
  const [privacySettings, setPrivacySettings] = useState({
    birthday: 'public',
    email: 'public',
    phone: 'public'
  });
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [bannerPic, setBannerPic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [bannerPicPreview, setBannerPicPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      birthday: date
    }));
  };

  const handleTagSelect = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handlePlatformUsernameChange = (platform, username) => {
    setPlatformUsernames(prev => ({
      ...prev,
      [platform]: username
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerPic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
    if (profilePicRef.current) {
      profilePicRef.current.value = '';
    }
  };

  const removeBannerPic = () => {
    setBannerPic(null);
    setBannerPicPreview(null);
    if (bannerPicRef.current) {
      bannerPicRef.current.value = '';
    }
  };

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setUploading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let profilePicUrl = '';
      let bannerPicUrl = '';

      if (profilePic) {
        profilePicUrl = await uploadImage(
          profilePic,
          `users/${userCredential.user.uid}/profile.jpg`
        );
      }

      if (bannerPic) {
        bannerPicUrl = await uploadImage(
          bannerPic,
          `users/${userCredential.user.uid}/banner.jpg`
        );
      }

      await updateProfile(userCredential.user, {
        displayName: formData.displayName,
        photoURL: profilePicUrl
      });

      // Create user document in Firestore
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        birthday: formData.birthday ? formData.birthday.toISOString() : null,
        email: formData.email,
        phone: formData.phone,
        clanTag: formData.clanTag,
        tags: selectedTags.length > 0 ? selectedTags : [],
        platformUsernames: Object.keys(platformUsernames).length > 0 ? platformUsernames : {},
        privacySettings,
        profilePic: profilePicUrl,
        bannerPic: bannerPicUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      navigate('/matchmaking');
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Profile Picture Upload */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={profilePicPreview}
                      sx={{ width: 120, height: 120 }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={() => profilePicRef.current?.click()}
                    >
                      <AddPhotoAlternateIcon />
                    </IconButton>
                    {profilePicPreview && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' }
                        }}
                        onClick={removeProfilePic}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <input
                    type="file"
                    accept="image/*"
                    ref={profilePicRef}
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Profile Picture
                  </Typography>
                </Box>
              </Grid>

              {/* Banner Picture Upload */}
              <Grid item xs={12}>
                <Box sx={{ position: 'relative', height: 150, mb: 2 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'grey.200',
                      backgroundImage: bannerPicPreview ? `url(${bannerPicPreview})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                    onClick={() => bannerPicRef.current?.click()}
                  >
                    <AddPhotoAlternateIcon />
                  </IconButton>
                  {bannerPicPreview && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={removeBannerPic}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={bannerPicRef}
                    onChange={handleBannerPicChange}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>

              {/* Rest of the form fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="@username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Birthday"
                  value={formData.birthday}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="tel"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Clan Tag (Optional)"
                  name="clanTag"
                  value={formData.clanTag}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Privacy Settings
                </Typography>
                {['birthday', 'email', 'phone'].map((field) => (
                  <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                    <InputLabel>{field.charAt(0).toUpperCase() + field.slice(1)} Visibility</InputLabel>
                    <Select
                      value={privacySettings[field]}
                      onChange={(e) => handlePrivacyChange(field, e.target.value)}
                      label={`${field.charAt(0).toUpperCase() + field.slice(1)} Visibility`}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="friends">Friends Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagSelect(tag)}
                      color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Platform Usernames
                </Typography>
                {platforms.map((platform) => (
                  <TextField
                    key={platform}
                    fullWidth
                    label={`${platform} Username`}
                    value={platformUsernames[platform] || ''}
                    onChange={(e) => handlePlatformUsernameChange(platform, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                ))}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={uploading}
                >
                  {uploading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <MuiLink component={Link} to="/login" variant="body2">
                    Already have an account? Sign in
                  </MuiLink>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}

export default SignUp; 