export const paypalConfig = {
  clientId: 'ATduo7VboepSzJ_qdJm2CgxPt71jAM0AoKl7DyG7QUJnmx8qUxydCIdSlFsztKBaSzUuM6r7b-fk5cY5',
  currency: 'USD',
  intent: 'capture',
  style: {
    layout: 'vertical',
    color: 'blue',
    shape: 'rect',
    label: 'paypal'
  }
};

export const subscriptionPlans = {
  basic: {
    planId: 'P-123456789',
    price: '9.99',
    features: [
      'Basic match scheduling',
      'Standard support',
      'Limited tournament access'
    ]
  },
  premium: {
    planId: 'P-987654321',
    price: '19.99',
    features: [
      'Advanced match scheduling',
      'Priority support',
      'Full tournament access',
      'Ad-free experience',
      'Custom branding'
    ]
  },
  pro: {
    planId: 'P-456789123',
    price: '49.99',
    features: [
      'All Premium features',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'White-label solution'
    ]
  }
}; 