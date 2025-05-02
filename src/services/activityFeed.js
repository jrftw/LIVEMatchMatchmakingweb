import { db } from '../firebase/config';
import { collection, query, where, orderBy, addDoc, onSnapshot, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';

export const activityFeedService = {
  // Create a new post
  async createPost(userId, content, mediaUrl = null) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      const postRef = await addDoc(collection(db, 'posts'), {
        userId,
        userDisplayName: userData.displayName,
        userPhotoURL: userData.photoURL,
        content,
        mediaUrl,
        likes: [],
        comments: [],
        timestamp: new Date(),
        type: 'post'
      });

      return postRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Create an activity (match, tournament, achievement, etc.)
  async createActivity(userId, type, data) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      const activityRef = await addDoc(collection(db, 'activities'), {
        userId,
        userDisplayName: userData.displayName,
        userPhotoURL: userData.photoURL,
        type,
        data,
        timestamp: new Date()
      });

      return activityRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  // Like a post
  async likePost(postId, userId) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Add a comment to a post
  async addComment(postId, userId, content) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      const comment = {
        userId,
        userDisplayName: userData.displayName,
        userPhotoURL: userData.photoURL,
        content,
        timestamp: new Date()
      };

      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion(comment)
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get feed items (posts and activities)
  getFeedItems(userId, callback) {
    const postsRef = collection(db, 'posts');
    const activitiesRef = collection(db, 'activities');

    const postsQuery = query(postsRef, orderBy('timestamp', 'desc'));
    const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'));

    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ posts });
    });

    const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ activities });
    });

    return () => {
      postsUnsubscribe();
      activitiesUnsubscribe();
    };
  },

  // Get user's feed items
  getUserFeedItems(userId, callback) {
    const postsRef = collection(db, 'posts');
    const activitiesRef = collection(db, 'activities');

    const postsQuery = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const activitiesQuery = query(
      activitiesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ posts });
    });

    const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ activities });
    });

    return () => {
      postsUnsubscribe();
      activitiesUnsubscribe();
    };
  }
}; 