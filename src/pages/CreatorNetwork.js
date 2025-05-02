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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

function CreatorNetwork() {
  const [networks, setNetworks] = useState([]);
  const [newNetwork, setNewNetwork] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    logoUrl: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkMembers, setNetworkMembers] = useState([]);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    const networksRef = collection(db, 'creatorNetworks');
    const querySnapshot = await getDocs(networksRef);
    const networksData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNetworks(networksData);
  };

  const handleCreateNetwork = async (e) => {
    e.preventDefault();
    try {
      const networkRef = await addDoc(collection(db, 'creatorNetworks'), {
        ...newNetwork,
        createdAt: new Date(),
        members: [],
      });
      
      setNewNetwork({
        name: '',
        description: '',
        website: '',
        contactEmail: '',
        logoUrl: '',
      });
      
      fetchNetworks();
    } catch (error) {
      console.error('Error creating network:', error);
    }
  };

  const handleUpdateNetwork = async (networkId, updatedData) => {
    try {
      const networkRef = doc(db, 'creatorNetworks', networkId);
      await updateDoc(networkRef, updatedData);
      fetchNetworks();
    } catch (error) {
      console.error('Error updating network:', error);
    }
  };

  const handleDeleteNetwork = async (networkId) => {
    try {
      await deleteDoc(doc(db, 'creatorNetworks', networkId));
      fetchNetworks();
    } catch (error) {
      console.error('Error deleting network:', error);
    }
  };

  const handleViewNetwork = async (network) => {
    setSelectedNetwork(network);
    // Fetch network members
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('networkId', '==', network.id));
    const querySnapshot = await getDocs(q);
    const members = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNetworkMembers(members);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create New Network
              </Typography>
              <form onSubmit={handleCreateNetwork}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Network Name"
                      value={newNetwork.name}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={newNetwork.description}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={newNetwork.website}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Contact Email"
                      value={newNetwork.contactEmail}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, contactEmail: e.target.value }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Logo URL"
                      value={newNetwork.logoUrl}
                      onChange={(e) => setNewNetwork(prev => ({ ...prev, logoUrl: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Create Network
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {networks.map((network) => (
                <Grid item xs={12} key={network.id}>
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
                          <Typography variant="h5" component="div">
                            {network.name}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary">
                            {network.website}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {network.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${network.members?.length || 0} Members`}
                          color="primary"
                        />
                        <Chip
                          label={network.contactEmail}
                          color="default"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleViewNetwork(network)}
                      >
                        View Members
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleUpdateNetwork(network.id, {})}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteNetwork(network.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedNetwork?.name} Members
          </DialogTitle>
          <DialogContent>
            <List>
              {networkMembers.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.displayName}
                    secondary={`@${member.username}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="remove">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default CreatorNetwork; 