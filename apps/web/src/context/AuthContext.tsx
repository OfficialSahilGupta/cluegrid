import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
  isSupporter?: boolean;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalGuesses: number;
    correctGuesses: number;
  };
  matchHistory: {
    id: number;
    roomCode: string;
    team: string;
    role: string;
    won: boolean;
    endedAt: string;
  }[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  mockSocialLogin: (provider: "google" | "discord") => Promise<void>;
  updateSettings: (username: string, avatar: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to construct request headers containing the active Firebase ID token
  const getHeaders = useCallback(async () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } catch (err) {
        console.error("Failed to retrieve Firebase ID Token:", err);
      }
    }
    return headers;
  }, []);

  // Fetch the PostgreSQL profile mapped to the authenticated Firebase user
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const headers = await getHeaders();
      const res = await fetch("/api/user/profile", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.profile);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load profile from database:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Subscribe to Firebase Auth state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await refreshProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.message || "Failed to sign in via Firebase.");
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set the display name inside Firebase Profile
      if (userCredential.user) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: username,
        });
      }
      // Trigger a profile lookup which automatically registers/syncs the user on the backend
      await refreshProfile();
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.message || "Failed to register via Firebase.");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Firebase sign out failed:", err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const mockSocialLogin = async (provider: "google" | "discord") => {
    setLoading(true);
    try {
      let authProvider;
      if (provider === "google") {
        authProvider = new GoogleAuthProvider();
      } else {
        // Discord is configured as an OIDC / Custom OAuth provider in Firebase console
        authProvider = new OAuthProvider("oidc.discord");
      }
      await signInWithPopup(auth, authProvider);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.message || `Simulated ${provider} authentication failed.`);
    }
  };

  const updateSettings = async (username: string, avatar: string) => {
    const headers = await getHeaders();
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers,
      body: JSON.stringify({ username, avatar }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update profile settings");
    }

    // Refresh profile state
    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        mockSocialLogin,
        updateSettings,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

