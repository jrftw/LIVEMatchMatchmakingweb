import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { auth, db } from '../test-setup';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function TestComponent() {
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestData = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'test'), {
        timestamp: new Date(),
        message: 'Test data added successfully'
      });
      console.log('Document written with ID: ', docRef.id);
      setLoading(false);
    } catch (error) {
      console.error('Error adding document: ', error);
      setLoading(false);
    }
  };

  const fetchTestData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'test'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestData(data);
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Component
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Firebase Connection Test
          </Typography>
          <Button
            variant="contained"
            onClick={addTestData}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Add Test Data
          </Button>
          
          <Typography variant="subtitle1" gutterBottom>
            Test Data:
          </Typography>
          <List>
            {testData.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.message}
                  secondary={new Date(item.timestamp?.toDate()).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            PayPal Test
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/subscription"
          >
            Test Subscription Page
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default TestComponent; 