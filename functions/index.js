/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

const functionConfig = {
  memory: "256MiB",
  region: "us-central1",
  maxInstances: 2,
  cors: true,
};

// Health check endpoint (public)
exports.health = functions.https.onRequest(functionConfig, (req, res) => {
  res.json({status: "ok", version: "1.03"});
});

// Middleware to authenticate requests
const authenticate = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("No authorization header");
  }
  const token = authHeader.split("Bearer ")[1];
  return admin.auth().verifyIdToken(token);
};

// Matchmaking endpoints
exports.getMatches = functions.https.onRequest(
    functionConfig,
    async (req, res) => {
      try {
        await authenticate(req);
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
        res.status(401).json({error: error.message});
      }
    },
);

exports.updateMatch = functions.https.onRequest(
    functionConfig,
    async (req, res) => {
      try {
        await authenticate(req);
        const {userId, availability} = req.body;
        await admin.firestore().collection("users").doc(userId).update({
          availability,
          lookingForMatches: true,
        });
        res.json({status: "success"});
      } catch (error) {
        console.error("Error updating match availability:", error);
        res.status(401).json({error: error.message});
      }
    },
);

// Tournament endpoints
exports.getTournaments = functions.https.onRequest(
    functionConfig,
    async (req, res) => {
      try {
        await authenticate(req);
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
        res.status(401).json({error: error.message});
      }
    },
);

exports.createTournament = functions.https.onRequest(
    functionConfig,
    async (req, res) => {
      try {
        await authenticate(req);
        const {name, startTime, maxParticipants} = req.body;
        const tournamentRef = await admin
            .firestore()
            .collection("brackets")
            .add({
              name,
              startTime,
              maxParticipants,
              participants: [],
              status: "open",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        res.json({id: tournamentRef.id, status: "success"});
      } catch (error) {
        console.error("Error creating tournament:", error);
        res.status(401).json({error: error.message});
      }
    },
);

exports.joinTournament = functions.https.onRequest(
    functionConfig,
    async (req, res) => {
      try {
        await authenticate(req);
        const {tournamentId, userId} = req.body;
        const tournamentRef = admin
            .firestore()
            .collection("brackets")
            .doc(tournamentId);
        const tournament = await tournamentRef.get();

        if (!tournament.exists) {
          return res.status(404).json({error: "Tournament not found"});
        }

        const data = tournament.data();
        if (data.participants.length >= data.maxParticipants) {
          return res.status(400).json({error: "Tournament is full"});
        }

        if (data.participants.includes(userId)) {
          return res.status(400).json({error: "Already joined"});
        }

        await tournamentRef.update({
          participants: admin.firestore.FieldValue.arrayUnion(userId),
        });

        res.json({status: "success"});
      } catch (error) {
        console.error("Error joining tournament:", error);
        res.status(401).json({error: error.message});
      }
    },
);
