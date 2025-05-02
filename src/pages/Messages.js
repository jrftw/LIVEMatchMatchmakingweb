import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    // Fetch user's chats
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', 'currentUserId')); // TODO: Replace with actual user ID
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(chats);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        senderId: 'currentUserId', // TODO: Replace with actual user ID
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', height: '80vh', mt: 4 }}>
        {/* Chat List */}
        <Paper sx={{ width: 300, mr: 2, overflow: 'auto' }}>
          <List>
            {messages.map((chat) => (
              <ListItem
                key={chat.id}
                button
                selected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              >
                <ListItemAvatar>
                  <Avatar src={chat.participantPhoto} />
                </ListItemAvatar>
                <ListItemText
                  primary={chat.participantName}
                  secondary={chat.lastMessage}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Window */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat ? (
            <>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">{selectedChat.participantName}</Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {/* Messages will be displayed here */}
              </Box>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Select a chat to start messaging
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Messages; 