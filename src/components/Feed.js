import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  MoreVert,
  Flag,
  Delete,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Feed() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !mediaFile) return;

    try {
      setIsUploading(true);
      let mediaUrl = '';

      if (mediaFile) {
        const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      const postData = {
        content: newPost.trim(),
        mediaUrl,
        mediaType: mediaFile?.type?.startsWith('video/') ? 'video' : 'image',
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email.split('@')[0],
        authorPhoto: currentUser.photoURL,
        likes: [],
        comments: [],
        shares: 0,
        reports: [],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'posts'), postData);
      setNewPost('');
      setMediaFile(null);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const isLiked = currentLikes.includes(currentUser.uid);
      const updatedLikes = isLiked
        ? currentLikes.filter(id => id !== currentUser.uid)
        : [...currentLikes, currentUser.uid];

      await updateDoc(postRef, { likes: updatedLikes });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const newComment = {
        id: Date.now().toString(),
        content: comment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email.split('@')[0],
        authorPhoto: currentUser.photoURL,
        createdAt: serverTimestamp(),
      };

      await updateDoc(postRef, {
        comments: [...(post.comments || []), newComment],
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      await updateDoc(postRef, { shares: (post.shares || 0) + 1 });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleReport = async () => {
    if (!selectedPost || !reportReason.trim()) return;

    try {
      const postRef = doc(db, 'posts', selectedPost.id);
      const post = posts.find(p => p.id === selectedPost.id);
      const newReport = {
        reason: reportReason.trim(),
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || currentUser.email.split('@')[0],
        createdAt: serverTimestamp(),
      };

      await updateDoc(postRef, {
        reports: [...(post.reports || []), newReport],
      });
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Create Post */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar src={currentUser.photoURL} />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              disabled={isUploading}
            >
              Upload Media
              <input
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files[0])}
              />
            </Button>
            <Button
              variant="contained"
              onClick={handleCreatePost}
              disabled={isUploading || (!newPost.trim() && !mediaFile)}
            >
              {isUploading ? 'Posting...' : 'Post'}
            </Button>
          </Box>
          {mediaFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Selected: {mediaFile.name}
              </Typography>
              {mediaFile.type.startsWith('image/') && (
                <Box
                  component="img"
                  src={URL.createObjectURL(mediaFile)}
                  alt="Preview"
                  sx={{ maxWidth: '100%', maxHeight: 200, mt: 1 }}
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No posts yet. Be the first to share something!
        </Typography>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={post.authorPhoto} 
                    onClick={() => navigate(`/profile/${post.authorId}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${post.authorId}`)}
                    >
                      {post.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt?.toDate()).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={(e) => handleMenuClick(e, post)}>
                  <MoreVert />
                </IconButton>
              </Box>

              {post.content && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>
              )}

              {post.mediaUrl && (
                post.mediaType === 'video' ? (
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                    src={post.mediaUrl}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    image={post.mediaUrl}
                    alt="Post media"
                    sx={{ maxHeight: 500, objectFit: 'contain' }}
                  />
                )
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleLike(post.id, post.likes || [])}>
                    {post.likes?.includes(currentUser.uid) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  <Typography>{post.likes?.length || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton>
                    <ChatBubbleOutline />
                  </IconButton>
                  <Typography>{post.comments?.length || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleShare(post.id)}>
                    <Share />
                  </IconButton>
                  <Typography>{post.shares || 0}</Typography>
                </Box>
              </Box>

              {/* Comments */}
              {post.comments?.map((comment) => (
                <Box key={comment.id} sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Avatar src={comment.authorPhoto} />
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.authorName}
                    </Typography>
                    <Typography variant="body2">
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* Add Comment */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Avatar src={currentUser.photoURL} />
                <TextField
                  fullWidth
                  placeholder="Write a comment..."
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(post.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Post Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedPost?.authorId === currentUser.uid ? (
          <MenuItem onClick={() => {
            handleDeletePost(selectedPost.id);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Post</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => {
            setReportDialogOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Flag fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report Post</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for reporting"
            fullWidth
            multiline
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReport} variant="contained" color="error">
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Feed; 