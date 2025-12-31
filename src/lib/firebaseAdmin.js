// Firebase Admin SDK for secure server operations
import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Initialize Firebase Admin only if all env vars exist
if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "⚠️ Firebase Admin not initialized: missing environment variables"
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // ✅ SAFE replace (only runs if privateKey exists)
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }
}

// Export a SAFE auth instance (prevents build crash)
export const adminAuth = admin.apps.length
  ? admin.auth()
  : {
      createUser: async () => {
        throw new Error("Firebase Admin not initialized");
      },
      setCustomUserClaims: async () => {
        throw new Error("Firebase Admin not initialized");
      },
      verifyIdToken: async () => {
        throw new Error("Firebase Admin not initialized");
      },
    };
