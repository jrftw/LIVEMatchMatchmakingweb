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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function CreatorNetwork() {
  const [currentUser, setCurrentUser] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
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
  });
  const [lastApplicationDate, setLastApplicationDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchNetworks();
        checkLastApplication(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const checkLastApplication = async (userId) => {
    try {
      const applicationsRef = collection(db, 'networkApplications');
      const q = query(applicationsRef, where('userId', '==', userId));
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
      const q = query(networksRef, where('status', '==', 'approved'));
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
      // Check if user has applied in the last 3 months
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
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application');
    }
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

        <Grid container spacing={3}>
          {networks.map((network) => (
            <Grid item xs={12} md={6} key={network.id}>
              <Card>
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
                      <Typography variant="h6" component="div">
                        {network.name}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {network.legalBusinessName}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {network.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {network.platforms.map((platform, index) => (
                      <Chip
                        key={index}
                        label={platform}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

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
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={applicationForm.lastName}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Creator Network or Agency Name"
                    value={applicationForm.networkName}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, networkName: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Legal Business Name"
                    value={applicationForm.legalBusinessName}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, legalBusinessName: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Address"
                    value={applicationForm.businessAddress}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business Zip Code"
                    value={applicationForm.businessZipCode}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, businessZipCode: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business State/Province"
                    value={applicationForm.businessState}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, businessState: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business Country"
                    value={applicationForm.businessCountry}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, businessCountry: e.target.value }))}
                    required
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
      </Box>
    </Container>
  );
}

export default CreatorNetwork; 