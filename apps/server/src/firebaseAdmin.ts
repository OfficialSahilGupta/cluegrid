import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let isFirebaseInitialized = false;

export function initializeFirebaseAdmin() {
  if (isFirebaseInitialized) return;
  if (getApps().length > 0) {
    isFirebaseInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  try {
    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(credentials),
        projectId: projectId || credentials.project_id,
      });
      isFirebaseInitialized = true;
      console.log("[firebase] Admin SDK initialized successfully via service account credentials.");
    } else if (projectId) {
      initializeApp({
        projectId,
      });
      isFirebaseInitialized = true;
      console.log("[firebase] Admin SDK initialized successfully via project ID.");
    } else {
      console.warn("[firebase] No Firebase configuration found. Server will run in Mock/Local Dev Token verification mode.");
    }
  } catch (error) {
    console.error("[firebase] Failed to initialize Firebase Admin SDK:", error);
  }
}

export interface DecodedFirebaseUser {
  uid: string;
  email?: string | undefined;
  name?: string | undefined;
  picture?: string | undefined;
}

/**
 * Verifies a Firebase ID token.
 * If Firebase Admin is initialized, it runs standard SDK verification.
 * If not, it falls back to decoding the token payload (for mock/local dev without secrets).
 */
export async function verifyFirebaseToken(token: string): Promise<DecodedFirebaseUser> {
  if (isFirebaseInitialized) {
    const decoded = await getAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  }

  // Fallback / Mock mode:
  // Parse JWT token manually to allow testing without Firebase Admin Secrets.
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadBase64 = parts[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);
        if (payload && payload.uid) {
          return {
            uid: payload.uid,
            email: payload.email,
            name: payload.name || payload.username || "Mock Firebase User",
          };
        }
      }
    }
  } catch (e) {
    // no-op
  }

  // If token is just a plain UID string (like during dev mock testing)
  if (token && token.length > 5 && !token.includes(".")) {
    return {
      uid: token,
      email: `${token.substring(0, 8)}@cluegrid-dev.local`,
      name: `Agent_${token.substring(0, 4)}`,
    };
  }

  throw new Error("Invalid token or Firebase Admin is not initialized.");
}
