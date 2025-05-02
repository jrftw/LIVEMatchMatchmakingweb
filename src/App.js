import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Matchmaking from './pages/Matchmaking';
import Tournaments from './pages/Tournaments';
import Achievements from './pages/Achievements';
import Help from './pages/Help';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import CreatorNetwork from './pages/CreatorNetwork';
import Messages from './pages/Messages';
import Feed from './pages/Feed';
import SubscriptionPlans from './components/SubscriptionPlans';
import TestComponent from './components/TestComponent';
import MyEvents from './pages/MyEvents';
import Leaderboards from './pages/Leaderboards';
import News from './pages/News';

// Components
import ModuleMenu from './components/ModuleMenu';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <ModuleMenu />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Navbar currentUser={currentUser} />
              <Box sx={{ flex: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={currentUser ? <Navigate to="/matchmaking" /> : <Login />} />
                  <Route path="/register" element={currentUser ? <Navigate to="/matchmaking" /> : <Register />} />
                  <Route path="/matchmaking" element={currentUser ? <Matchmaking /> : <Navigate to="/login" />} />
                  <Route path="/tournaments" element={currentUser ? <Tournaments /> : <Navigate to="/login" />} />
                  <Route path="/achievements" element={currentUser ? <Achievements /> : <Navigate to="/login" />} />
                  <Route path="/leaderboards" element={<PrivateRoute><Leaderboards /></PrivateRoute>} />
                  <Route path="/news" element={<PrivateRoute><News /></PrivateRoute>} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
                  <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
                  <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
                  <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
                  <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/settings" element={currentUser ? <Settings /> : <Navigate to="/login" />} />
                  <Route path="/subscription" element={<PrivateRoute><SubscriptionPlans /></PrivateRoute>} />
                  <Route path="/test" element={<TestComponent />} />
                  <Route path="/my-events" element={<PrivateRoute><MyEvents /></PrivateRoute>} />
                </Routes>
              </Box>
            </Box>
          </Box>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 