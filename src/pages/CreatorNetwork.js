import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Rating,
  Divider,
  Tooltip,
  Badge,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Facebook as FacebookIcon,
  TikTok as TikTokIcon,
  Favorite as FavoriteIcon,
  LiveTv as LiveTvIcon,
} from '@mui/icons-material';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function CreatorNetwork() {
  const { currentUser } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [applicationForm, setApplicationForm] = useState({
    firstName: '',
    lastName: '',
    networkName: '',
    legalBusinessName: '',
    businessAddress: '',
    businessZipCode: '',
    businessState: '',
    businessCountry: '',
    platforms: [],
    businessLicense: null,
    proofOfManaging: null,
    website: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    languages: [],
    description: '',
    targetAudience: [],
  });
  const [lastApplicationDate, setLastApplicationDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const navigate = useNavigate();
  const auth = getAuth();

  const audienceOptions = [
    'Gaming',
    'Music',
    'Art',
    'Education',
    'Technology',
    'Fitness',
    'Fashion',
    'Food',
    'Travel',
    'LIVE Match',
    'Mental Health',
    'Other',
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchNetworks();
    checkLastApplication();
  }, [currentUser, navigate]);

  const checkLastApplication = async () => {
    try {
      const applicationsRef = collection(db, 'networkApplications');
      const q = query(applicationsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastApplication = querySnapshot.docs[querySnapshot.docs.length - 1].data();
        setLastApplicationDate(lastApplication.createdAt);
      }
    } catch (error) {
      console.error('Error checking last application:', error);
    }
  };

  const fetchNetworks = async () => {
    try {
      const networksRef = collection(db, 'creatorNetworks');
      const q = query(networksRef, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const networksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNetworks(networksData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching networks:', error);
      setError('Failed to fetch networks');
      setLoading(false);
    }
  };

  const fetchNetworkReviews = async (networkId) => {
    try {
      const reviewsRef = collection(db, 'networkReviews');
      const q = query(reviewsRef, where('networkId', '==', networkId), orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setApplicationForm(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      if (lastApplicationDate) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (lastApplicationDate.toDate() > threeMonthsAgo) {
          setError('You can only apply once every 3 months');
          return;
        }
      }

      const applicationData = {
        ...applicationForm,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'networkApplications'), applicationData);
      setShowApplicationDialog(false);
      setSuccess('Application submitted successfully! It may take up to 30 days to review.');
      setApplicationForm({
        firstName: '',
        lastName: '',
        networkName: '',
        legalBusinessName: '',
        businessAddress: '',
        businessZipCode: '',
        businessState: '',
        businessCountry: '',
        platforms: [],
        businessLicense: null,
        proofOfManaging: null,
        website: '',
        socialMedia: {
          instagram: '',
          twitter: '',
          linkedin: '',
        },
        languages: [],
        description: '',
        targetAudience: [],
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        ...reviewForm,
        networkId: selectedNetwork.id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'networkReviews'), reviewData);
      setShowReviewDialog(false);
      setSuccess('Review submitted successfully!');
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
      });
      fetchNetworkReviews(selectedNetwork.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review');
    }
  };

  const handleNetworkClick = (network) => {
    setSelectedNetwork(network);
    setShowNetworkDetails(true);
    fetchNetworkReviews(network.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setApplicationForm(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleAudienceChange = (e) => {
    const { value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      targetAudience: value
    }));
  };

  const handleCustomAudienceAdd = () => {
    if (applicationForm.customAudience?.trim()) {
      setApplicationForm(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, prev.customAudience.trim()],
        customAudience: ''
      }));
    }
  };

  const handleAudienceDelete = (audienceToDelete) => {
    setApplicationForm(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(audience => audience !== audienceToDelete)
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Creator Networks</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowApplicationDialog(true)}
            disabled={lastApplicationDate && new Date(lastApplicationDate.toDate()) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
          >
            Apply For Network (Agency)
          </Button>
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Networks" />
          <Tab label="Top Rated" />
          <Tab label="Newest" />
          <Tab label="By Platform" />
        </Tabs>

        <Grid container spacing={3}>
          {networks.map((network) => (
            <Grid item xs={12} md={6} key={network.id}>
              <Card onClick={() => handleNetworkClick(network)} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {network.logoUrl ? (
                      <Avatar
                        src={network.logoUrl}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                        {network.name.charAt(0)}
                      </Avatar>
                    )}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                          {network.name}
                        </Typography>
                        {network.verified && (
                          <Tooltip title="Verified Network">
                            <VerifiedIcon color="primary" sx={{ ml: 1 }} />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        {network.legalBusinessName}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {network.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {network.platforms.map((platform, index) => (
                      <Chip
                        key={index}
                        label={platform}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon color="warning" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {network.rating?.toFixed(1) || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon color="action" />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {network.creatorCount || 0} Creators
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={showNetworkDetails}
          onClose={() => setShowNetworkDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {selectedNetwork?.logoUrl ? (
                <Avatar
                  src={selectedNetwork.logoUrl}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
              ) : (
                <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                  {selectedNetwork?.name.charAt(0)}
                </Avatar>
              )}
              {selectedNetwork?.name}
              {selectedNetwork?.verified && (
                <Tooltip title="Verified Network">
                  <VerifiedIcon color="primary" sx={{ ml: 1 }} />
                </Tooltip>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedNetwork?.description}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">
                    {selectedNetwork?.legalBusinessName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {selectedNetwork?.businessAddress}, {selectedNetwork?.businessCity}, {selectedNetwork?.businessState}, {selectedNetwork?.businessCountry}
                  </Typography>
                </Box>
                {selectedNetwork?.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LanguageIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <RouterLink href={selectedNetwork.website} target="_blank" rel="noopener noreferrer">
                        {selectedNetwork.website}
                      </RouterLink>
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Platforms
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedNetwork?.platforms.map((platform, index) => (
                    <Chip
                      key={index}
                      label={platform}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Reviews
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    Write a Review
                  </Button>
                </Box>
                <List>
                  {reviews.map((review) => (
                    <ListItem key={review.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{review.userEmail.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {review.title}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" sx={{ ml: 1 }} />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.userEmail} • {new Date(review.createdAt.toDate()).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNetworkDetails(false)}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowApplicationDialog(true)}
            >
              Apply to Join
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Apply For Network (Agency)</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmitApplication}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={applicationForm.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={applicationForm.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Creator Network or Agency Name"
                    value={applicationForm.networkName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Legal Business Name"
                    value={applicationForm.legalBusinessName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    value={applicationForm.businessAddress}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business Zip Code"
                    value={applicationForm.businessZipCode}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business State/Province"
                    value={applicationForm.businessState}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business Country"
                    value={applicationForm.businessCountry}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={applicationForm.website}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={applicationForm.socialMedia.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={applicationForm.socialMedia.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={applicationForm.socialMedia.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Platforms</InputLabel>
                    <Select
                      multiple
                      value={applicationForm.platforms}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, platforms: e.target.value }))}
                      label="Platforms"
                      renderValue={(selected) => selected.join(', ')}
                      required
                    >
                      <MenuItem value="TikTok">TikTok</MenuItem>
                      <MenuItem value="Bigo">Bigo</MenuItem>
                      <MenuItem value="LIVE.ME">LIVE.ME</MenuItem>
                      <MenuItem value="Mango">Mango</MenuItem>
                      <MenuItem value="Favorited">Favorited</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Languages</InputLabel>
                    <Select
                      multiple
                      value={applicationForm.languages}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, languages: e.target.value }))}
                      label="Languages"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="Portuguese">Portuguese</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                      <MenuItem value="Italian">Italian</MenuItem>
                      <MenuItem value="Russian">Russian</MenuItem>
                      <MenuItem value="Japanese">Japanese</MenuItem>
                      <MenuItem value="Korean">Korean</MenuItem>
                      <MenuItem value="Chinese">Chinese</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={applicationForm.description}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Target Audience</InputLabel>
                    <Select
                      multiple
                      value={applicationForm.targetAudience}
                      onChange={handleAudienceChange}
                      label="Target Audience"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {audienceOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload Business License
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'businessLicense')}
                      required
                    />
                  </Button>
                  {applicationForm.businessLicense && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Selected: {applicationForm.businessLicense.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload Proof of Managing
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'proofOfManaging')}
                      required
                    />
                  </Button>
                  {applicationForm.proofOfManaging && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Selected: {applicationForm.proofOfManaging.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <DialogActions>
                <Button onClick={() => setShowApplicationDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">
                  Submit Application
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmitReview}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={reviewForm.rating}
                    onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, rating: newValue }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Comment"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    required
                  />
                </Grid>
              </Grid>
              <DialogActions>
                <Button onClick={() => setShowReviewDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">
                  Submit Review
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default CreatorNetwork; 