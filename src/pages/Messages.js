import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ChatMessages from '../components/ChatMessages';

function Messages() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);

  // Fetch conversations and friends
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeConversations = onSnapshot(
      collection(db, 'conversations'),
      (snapshot) => {
        const userConversations = snapshot.docs
          .filter(doc => doc.data().participants.includes(currentUser.uid))
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
        setConversations(userConversations);
      }
    );

    const unsubscribeFriends = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setFriends(doc.data().friends || []);
        }
      }
    );

    return () => {
      unsubscribeConversations();
      unsubscribeFriends();
    };
  }, [currentUser]);

  // Search for users
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '>=', searchTerm),
          where('username', '<=', searchTerm + '\uf8ff')
        );
        const snapshot = await getDocs(usersQuery);
        const results = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(user => user.id !== currentUser.uid && !friends.includes(user.id));
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    searchUsers();
  }, [searchTerm, currentUser, friends]);

  const handleAddFriend = async (userId) => {
    try {
      // Add to current user's friends list
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayUnion(userId)
      });

      // Add to other user's friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(currentUser.uid)
      });

      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      // Remove from current user's friends list
      await updateDoc(doc(db, 'users', currentUser.uid), {
        friends: arrayRemove(userId)
      });

      // Remove from other user's friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(currentUser.uid)
      });
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const participants = [...selectedUsers.map(user => user.id), currentUser.uid];
      const groupData = {
        name: groupName,
        participants,
        isGroup: true,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastMessageTime: null,
      };

      const docRef = await addDoc(collection(db, 'conversations'), groupData);
      setShowNewChatDialog(false);
      setSelectedUsers([]);
      setGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.length === 2 && 
        conv.participants.includes(userId)
      );

      if (existingConversation) {
        setActiveConversation(existingConversation);
        return;
      }

      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, userId],
        isGroup: false,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        lastMessageTime: null,
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      setShowNewChatDialog(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
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
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        {/* Sidebar */}
        <Box sx={{ width: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Messages</Typography>
            <IconButton onClick={() => setShowNewChatDialog(true)}>
              <AddIcon />
            </IconButton>
          </Box>

          <List>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                button
                selected={activeConversation?.id === conversation.id}
                onClick={() => setActiveConversation(conversation)}
              >
                <ListItemAvatar>
                  <Badge
                    color="primary"
                    variant="dot"
                    invisible={!conversation.unreadCount}
                  >
                    <Avatar>
                      {conversation.isGroup ? <GroupIcon /> : null}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={conversation.isGroup ? conversation.name : 'Friend Name'}
                  secondary={conversation.lastMessage}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {activeConversation ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {activeConversation.isGroup ? activeConversation.name : 'Friend Name'}
                </Typography>
                {activeConversation.isGroup && (
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>

              {/* Chat messages */}
              <ChatMessages conversation={activeConversation} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Select a conversation or start a new one
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onClose={() => setShowNewChatDialog(false)}>
        <DialogTitle>New Chat</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user.id}
                label={user.username}
                onDelete={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            label="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => {
                  if (selectedUsers.some(u => u.id === user.id)) {
                    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                  } else {
                    setSelectedUsers(prev => [...prev, user]);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profileImage} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
                {selectedUsers.some(u => u.id === user.id) ? (
                  <IconButton>
                    <PersonRemoveIcon />
                  </IconButton>
                ) : (
                  <IconButton>
                    <PersonAddIcon />
                  </IconButton>
                )}
              </ListItem>
            ))}
          </List>
          {selectedUsers.length > 1 && (
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedUsers.length === 1) {
                handleStartConversation(selectedUsers[0].id);
              } else {
                handleCreateGroup();
              }
            }}
            variant="contained"
            disabled={selectedUsers.length === 0 || (selectedUsers.length > 1 && !groupName)}
          >
            {selectedUsers.length === 1 ? 'Start Chat' : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriendDialog} onClose={() => setShowAddFriendDialog(false)}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {searchResults.map((user) => (
              <ListItem
                key={user.id}
                button
                onClick={() => handleAddFriend(user.id)}
              >
                <ListItemAvatar>
                  <Avatar src={user.profileImage} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
                <IconButton>
                  <PersonAddIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddFriendDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Messages; 