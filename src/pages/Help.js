import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Link,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FAQIcon from '@mui/icons-material/QuestionAnswer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'How do I schedule a live match?',
    answer: 'To schedule a live match, go to the Matchmaking page and browse available matches. You can filter by platform, time, and game format. Once you find a match you like, click "Join Match" to participate.',
  },
  {
    question: 'How do I join a tournament?',
    answer: 'Navigate to the Tournaments page to view available tournaments. You can filter by platform, entry fee, and game format. Click on a tournament to view details and click "Join Tournament" to participate.',
  },
  {
    question: 'How do I set my availability?',
    answer: 'Go to the Matchmaking page and click on the "Set Availability" tab. You can select your available time slots for each day of the week. Make sure to save your changes.',
  },
  {
    question: 'How do I earn achievements?',
    answer: 'Achievements are earned by completing various activities on the platform, such as participating in matches, winning tournaments, and being active in the community. Check your progress on the Achievements page.',
  },
  {
    question: 'How do I update my profile?',
    answer: 'Go to Settings to update your profile information, including your display name, bio, social links, and platform usernames. Make sure to save your changes.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Cash App, Venmo, PayPal, and platform gifts for tournament entry fees. You can add your payment information in the Settings page.',
  },
  {
    question: 'How do I contact support?',
    answer: 'You can contact our support team by filling out the form on this page or emailing support@infinitumlive.com. Our support hours are 8:00 AM - 8:00 PM EST, Monday through Sunday.',
  },
];

function Help() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    // For now, we'll just show the success message
    setSubmitted(true);
    
    // Create mailto link with form data
    const mailtoLink = `mailto:support@infinitumlive.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;
    
    // Open email client
    window.location.href = mailtoLink;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Frequently Asked Questions
              </Typography>
              {faqs.map((faq, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Support
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Fill out the form below or email us directly at{' '}
                <Link href="mailto:support@infinitumlive.com" color="primary">
                  support@infinitumlive.com
                </Link>
              </Typography>

              {submitted ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your message has been sent! We'll get back to you as soon as possible.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<EmailIcon />}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportAgentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Support Hours</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Monday - Sunday: 8:00 AM - 8:00 PM EST
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FAQIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Quick Links</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                • <Link href="/tutorials" color="primary">Getting Started Guide</Link>
                <br />
                • <Link href="/documentation" color="primary">Documentation</Link>
                <br />
                • <Link href="/terms" color="primary">Terms of Service</Link>
                <br />
                • <Link href="/privacy" color="primary">Privacy Policy</Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Help; 