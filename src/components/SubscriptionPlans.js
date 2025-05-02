import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paypalConfig, subscriptionPlans } from '../config/paypal';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscription = async (planId) => {
    setLoading(true);
    try {
      // Here you would typically make a server-side call to create the subscription
      // For now, we'll just update the user's subscription status in Firestore
      const userDoc = doc(db, 'users', 'currentUserId'); // Replace with actual user ID
      await updateDoc(userDoc, {
        subscription: {
          planId,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Error processing subscription:', error);
      setLoading(false);
    }
  };

  return (
    <PayPalScriptProvider options={paypalConfig}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Choose Your Plan
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(subscriptionPlans).map(([planKey, plan]) => (
            <Card key={planKey} sx={{ minWidth: 300, maxWidth: 350 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan
                </Typography>
                <Typography variant="h4" gutterBottom>
                  ${plan.price}/month
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 3 }}>
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createSubscription={(data, actions) => {
                      return actions.subscription.create({
                        plan_id: plan.planId
                      });
                    }}
                    onApprove={async (data, actions) => {
                      await handleSubscription(plan.planId);
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </PayPalScriptProvider>
  );
}

export default SubscriptionPlans; 