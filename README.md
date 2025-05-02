# LiveMatch - Creator Live Match Scheduling Platform

LiveMatch is a web-based platform that helps creators schedule and manage live matches across various platforms like TikTok, Favorited, Bigo, and Mango. It also provides features for tournament management, creator networking, and social interaction.

## Features

- **User Authentication**
  - Sign up with email and password
  - Profile management with customizable privacy settings
  - Platform username integration

- **Live Match Scheduling**
  - Schedule live matches with other creators
  - Tinder-like swiping interface to find potential match partners
  - Calendar integration for match scheduling

- **Tournament Management**
  - Create and manage tournaments
  - Join existing tournaments
  - Track tournament progress and results

- **Creator Networks**
  - Create and join creator networks/agencies
  - Manage network members
  - Network-specific features and communication

- **Social Features**
  - Follow other creators
  - Direct messaging
  - Activity feed
  - Profile customization

- **Premium Features**
  - Ad-free experience
  - Advanced tournament features
  - Enhanced profile customization
  - Priority matchmaking

## Tech Stack

- **Frontend**
  - React
  - Material-UI
  - React Router
  - React Hook Form
  - React Swipeable

- **Backend**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Storage

- **Additional Tools**
  - Google AdMob
  - Stripe (for subscription payments)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/livematch.git
cd livematch
```

2. Install dependencies
```bash
npm install
```

3. Create a Firebase project and add your configuration
Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server
```bash
npm start
```

## Project Structure

```
src/
  ├── components/         # Reusable UI components
  ├── contexts/          # React contexts (Auth, etc.)
  ├── firebase/          # Firebase configuration and utilities
  ├── pages/             # Page components
  ├── App.js             # Main application component
  └── index.js           # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/livematch 