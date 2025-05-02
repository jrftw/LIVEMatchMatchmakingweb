import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import ModuleMenu from './components/ModuleMenu';
import PrivateRoute from './components/PrivateRoute';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Matchmaking = lazy(() => import('./pages/Matchmaking'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Help = lazy(() => import('./pages/Help'));
const Settings = lazy(() => import('./pages/Settings'));
const Gaming = lazy(() => import('./pages/Gaming'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Profile = lazy(() => import('./pages/Profile'));
const Discover = lazy(() => import('./pages/Discover'));
const Matches = lazy(() => import('./pages/Matches'));
const CreatorNetwork = lazy(() => import('./pages/CreatorNetwork'));
const Messages = lazy(() => import('./pages/Messages'));
const Feed = lazy(() => import('./pages/Feed'));
const SubscriptionPlans = lazy(() => import('./components/SubscriptionPlans'));
const TestComponent = lazy(() => import('./components/TestComponent'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const Leaderboards = lazy(() => import('./pages/Leaderboards'));
const News = lazy(() => import('./pages/News'));

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
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <ModuleMenu />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar currentUser={currentUser} />
                <Box sx={{ flex: 1, p: 3 }}>
                  <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/login" element={currentUser ? <Navigate to="/matchmaking" /> : <Login />} />
                      <Route path="/register" element={currentUser ? <Navigate to="/matchmaking" /> : <Register />} />
                      <Route path="/matchmaking" element={currentUser ? <Matchmaking /> : <Navigate to="/login" />} />
                      <Route path="/gaming" element={currentUser ? <Gaming /> : <Navigate to="/login" />} />
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
                  </Suspense>
                </Box>
              </Box>
            </Box>
            <Footer />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App; 