/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

admin.initializeApp();
const app = express();

// Rate limiting to prevent abuse (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {error: "Too many requests, please try again later"},
});

// Apply rate limiting to all requests
app.use(limiter);

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

// Basic health check endpoint (public)
app.get("/api/health", (req, res) => {
  res.json({status: "ok", version: "1.03 Build 1"});
});

// Add middleware to authenticate requests
app.use(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({error: "No authorization header"});
    }
    const token = authHeader.split("Bearer ")[1];
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({error: "Invalid token"});
  }
});

// Matchmaking endpoints
app.get("/api/matches", async (req, res) => {
  try {
    const matchesRef = admin.firestore().collection("users");
    const snapshot = await matchesRef
        .where("lookingForMatches", "==", true)
        .get();

    const matches = [];
    snapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({error: "Failed to fetch matches"});
  }
});

app.post("/api/matches", async (req, res) => {
  try {
    const {userId, availability} = req.body;
    await admin.firestore().collection("users").doc(userId).update({
      availability,
      lookingForMatches: true,
    });
    res.json({status: "success"});
  } catch (error) {
    console.error("Error updating match availability:", error);
    res.status(500).json({error: "Failed to update availability"});
  }
});

// Tournament endpoints
app.get("/api/tournaments", async (req, res) => {
  try {
    const tournamentsRef = admin.firestore().collection("brackets");
    const snapshot = await tournamentsRef.get();

    const tournaments = [];
    snapshot.forEach((doc) => {
      tournaments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({error: "Failed to fetch tournaments"});
  }
});

app.post("/api/tournaments", async (req, res) => {
  try {
    const tournamentData = req.body;
    const docRef = await admin.firestore().collection("brackets").add({
      ...tournamentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({id: docRef.id, status: "success"});
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({error: "Failed to create tournament"});
  }
});

app.post("/api/tournaments/:id/join", async (req, res) => {
  try {
    const {id} = req.params;
    const {userId} = req.body;

    const tournamentRef = admin.firestore().collection("brackets").doc(id);
    await tournamentRef.update({
      participants: admin.firestore.FieldValue.arrayUnion(userId),
    });

    res.json({status: "success"});
  } catch (error) {
    console.error("Error joining tournament:", error);
    res.status(500).json({error: "Failed to join tournament"});
  }
});

// Export the Express app as a Firebase Function with cost optimization
exports.api = onRequest({
  memory: "256MiB",
  maxInstances: 2,
  timeoutSeconds: 30,
}, app);
