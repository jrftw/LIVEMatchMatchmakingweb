import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Helper function to convert timezone
const convertToUTC = (date, timezone) => {
  const dateObj = new Date(date);
  const utcDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  return utcDate;
};

// Helper function to check time overlap
const checkTimeOverlap = (user1Availability, user2Availability, timezone) => {
  const user1Slots = user1Availability.map(slot => {
    const [hours, minutes] = slot.split(':');
    return convertToUTC(new Date().setHours(hours, minutes), timezone);
  });

  const user2Slots = user2Availability.map(slot => {
    const [hours, minutes] = slot.split(':');
    return convertToUTC(new Date().setHours(hours, minutes), timezone);
  });

  return user1Slots.some(slot1 => 
    user2Slots.some(slot2 => 
      Math.abs(slot1 - slot2) < 15 * 60 * 1000 // 15 minutes tolerance
    )
  );
};

// Auto-pairing logic
export const autoPairCreators = async (type, preferences) => {
  try {
    const usersRef = collection(db, 'users');
    const availableUsers = await getDocs(query(
      usersRef,
      where('lookingForMatches', '==', true)
    ));

    const users = availableUsers.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Group users by platform and format
    const groups = {};
    users.forEach(user => {
      const key = `${user.platform}_${user.preferredFormat}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(user);
    });

    // Find matching pairs
    const pairs = [];
    for (const [key, group] of Object.entries(groups)) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const user1 = group[i];
          const user2 = group[j];

          if (checkTimeOverlap(user1.availability, user2.availability, user1.timezone)) {
            pairs.push({
              type,
              user1Id: user1.id,
              user2Id: user2.id,
              platform: user1.platform,
              format: user1.preferredFormat,
              timezone: user1.timezone,
              matchingSlots: findMatchingSlots(user1.availability, user2.availability, user1.timezone)
            });
          }
        }
      }
    }

    return pairs;
  } catch (error) {
    console.error('Error in auto-pairing:', error);
    return [];
  }
};

// Find matching time slots
const findMatchingSlots = (user1Slots, user2Slots, timezone) => {
  const matchingSlots = [];
  user1Slots.forEach(slot1 => {
    user2Slots.forEach(slot2 => {
      const [hours1, minutes1] = slot1.split(':');
      const [hours2, minutes2] = slot2.split(':');
      const date1 = convertToUTC(new Date().setHours(hours1, minutes1), timezone);
      const date2 = convertToUTC(new Date().setHours(hours2, minutes2), timezone);

      if (Math.abs(date1 - date2) < 15 * 60 * 1000) {
        matchingSlots.push({
          time: slot1,
          timezone
        });
      }
    });
  });
  return matchingSlots;
};

// Generate weekly events
export const generateWeeklyEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Generate free brackets
    const freeBrackets = [
      {
        type: 'bracket',
        name: 'Weekly Free-for-All',
        format: '1v1',
        platform: 'TikTok',
        maxPlayers: 16,
        startDate: Timestamp.fromDate(nextWeek),
        endDate: Timestamp.fromDate(new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000)),
        entryFee: {
          type: 'free',
          amount: 0
        },
        status: 'open'
      },
      {
        type: 'box_battle',
        name: 'Weekly Box Battle',
        platform: 'TikTok',
        maxPlayers: 9,
        startDate: Timestamp.fromDate(nextWeek),
        endDate: Timestamp.fromDate(new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000)),
        entryFee: {
          type: 'free',
          amount: 0
        },
        status: 'open'
      }
    ];

    // Add events to Firestore
    for (const bracket of freeBrackets) {
      await addDoc(eventsRef, bracket);
    }

    return freeBrackets;
  } catch (error) {
    console.error('Error generating weekly events:', error);
    return [];
  }
};

// Manual pairing function
export const manualPairCreators = async (user1Id, user2Id, type, preferences) => {
  try {
    const eventsRef = collection(db, 'events');
    const eventData = {
      type,
      user1Id,
      user2Id,
      ...preferences,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    await addDoc(eventsRef, eventData);
    return true;
  } catch (error) {
    console.error('Error in manual pairing:', error);
    return false;
  }
}; 