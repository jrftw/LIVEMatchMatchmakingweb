import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const newsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNews(newsData);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Platform News
        </Typography>

        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageURL || '/default-news.jpg'}
                  alt={item.title}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={item.category}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {item.content}
                  </Typography>
                  {item.link && (
                    <Button
                      variant="contained"
                      color="primary"
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default News; 