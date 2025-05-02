import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      await addDoc(collection(db, 'posts'), {
        text: newPost,
        userId: 'currentUserId', // TODO: Replace with actual user ID
        userDisplayName: 'Current User', // TODO: Replace with actual user name
        userPhotoURL: '', // TODO: Replace with actual user photo
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
      });
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    // TODO: Implement like functionality
  };

  const handleComment = async (postId, comment) => {
    // TODO: Implement comment functionality
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {/* Create Post */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }} />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreatePost}
              disabled={!newPost.trim()}
            >
              Post
            </Button>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {posts.map((post) => (
          <Card key={post.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={post.userPhotoURL} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">{post.userDisplayName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.timestamp?.toDate().toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.text}
              </Typography>
              {post.imageURL && (
                <CardMedia
                  component="img"
                  height="300"
                  image={post.imageURL}
                  alt="Post image"
                  sx={{ mb: 2 }}
                />
              )}
              <Grid container spacing={2}>
                <Grid item>
                  <IconButton onClick={() => handleLike(post.id)}>
                    <FavoriteIcon color={post.likes?.includes('currentUserId') ? 'error' : 'inherit'} />
                  </IconButton>
                  <Typography variant="caption">{post.likes?.length || 0}</Typography>
                </Grid>
                <Grid item>
                  <IconButton>
                    <CommentIcon />
                  </IconButton>
                  <Typography variant="caption">{post.comments?.length || 0}</Typography>
                </Grid>
                <Grid item>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default Feed; 