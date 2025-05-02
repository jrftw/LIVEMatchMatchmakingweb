import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

function Settings() {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [themeMode, setThemeMode] = useState('auto');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleThemeChange = (event) => {
    const newThemeMode = event.target.value;
    setThemeMode(newThemeMode);
    // Here you would typically update the theme in your theme context
    // For example: updateThemeMode(newThemeMode);
  };

  const changeLog = [
    {
      version: '1.03',
      date: '2024-05-02',
      changes: [
        'Updated Firebase Functions to v2',
        'Improved API endpoints and authentication',
        'Fixed deployment issues',
        'Updated copyright information',
      ],
    },
    {
      version: '1.0.0',
      date: '2024-05-01',
      changes: [
        'Initial release',
        'Added network creation and management',
        'Implemented user authentication',
        'Added theme customization',
      ],
    },
    {
      version: '0.9.0',
      date: '2024-04-15',
      changes: [
        'Beta testing phase',
        'Added basic network features',
        'Implemented user profiles',
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Appearance" />
          <Tab label="Change Log" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Theme Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Theme Mode</InputLabel>
              <Select
                value={themeMode}
                onChange={handleThemeChange}
                label="Theme Mode"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto (System)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Choose your preferred theme mode. "Auto" will follow your system's theme settings.
            </Typography>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Version History
            </Typography>
            <List>
              {changeLog.map((release, index) => (
                <React.Fragment key={release.version}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            Version {release.version}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({release.date})
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <List dense disablePadding>
                          {release.changes.map((change, changeIndex) => (
                            <ListItem key={changeIndex} sx={{ pl: 2 }}>
                              <ListItemText
                                primary={change}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      }
                    />
                  </ListItem>
                  {index < changeLog.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default Settings; 