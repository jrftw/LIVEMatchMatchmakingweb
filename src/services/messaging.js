import { db } from '../firebase/config';
import { collection, query, where, orderBy, addDoc, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';

export const messagingService = {
  // Create a new chat
  async createChat(participants) {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        participants,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: {},
        createdAt: new Date()
      });
      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(chatId, senderId, content) {
    try {
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId,
        content,
        timestamp: new Date(),
        read: false
      });

      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastMessageTime: new Date(),
        [`unreadCount.${senderId}`]: 0
      });

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(chatId, userId) {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages(chatId, callback) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  // Get user's chats
  getUserChats(userId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find(id => id !== userId);
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        return {
          id: doc.id,
          ...chatData,
          otherUser: otherUserDoc.data()
        };
      }));
      callback(chats);
    });
  }
}; 