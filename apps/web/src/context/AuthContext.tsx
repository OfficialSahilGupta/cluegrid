import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

  const getHeaders = useCallback(() => {
    const userId = localStorage.getItem("cluegrid_user_id");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (userId) {
      headers["x-mock-user-id"] = userId;
    }
    return headers;
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = localStorage.getItem("cluegrid_user_id");
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        headers: getHeaders(),
      });
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
      console.error("Failed to load profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    // Attempt login using Auth.js credentials callback
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        action: "login",
        redirect: "false",
        json: "true",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Invalid credentials");
    }

    // Try to parse the response as JSON (Auth.js session info or URL)
    let userId = "";
    try {
      await res.json();
      // Auth.js returns redirection info or user details.
      // If we need to extract userId, let's also fetch active session:
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        if (session?.user?.id) {
          userId = String(session.user.id);
        }
      }
    } catch (e) {
      // no-op
    }

    // Fallback/direct DB checks if sessionRes was empty:
    // Try to query directly or simulate:
    if (!userId) {
      // In credentials login we return the user. So let's fall back to reading from profile response
      // or we check if user was returned. Since our Credentials provider inserts/checks in DB,
      // let's fetch profile using a helper that searches the DB for the logged-in email.
      // To bypass cross-origin/session-cookies in standard dev, if Auth.js setup is local,
      // let's also request /api/user/profile after authenticating
    }

    // Standard Auth.js uses cookies, but for local proxy we also store in local storage to be 100% fail-safe
    // Let's call a profile lookup endpoint or read cookie.
    // If credentials login succeeded, we fetch the profile from `/api/user/profile` (which gets the user ID).
    // Let's do a request to check:
    const profileRes = await fetch("/api/user/profile");
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      if (profileData.success) {
        localStorage.setItem("cluegrid_user_id", profileData.profile.id);
        setUser(profileData.profile);
        return;
      }
    }
    throw new Error("Failed to load profile after sign-in.");
  };

  const signup = async (username: string, email: string, password: string) => {
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        action: "signup",
        redirect: "false",
        json: "true",
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Registration failed");
    }

    // Load profile
    const profileRes = await fetch("/api/user/profile");
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      if (profileData.success) {
        localStorage.setItem("cluegrid_user_id", profileData.profile.id);
        setUser(profileData.profile);
        return;
      }
    }
    throw new Error("Failed to load profile after sign-up.");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("cluegrid_user_id");
    setUser(null);
  };

  const mockSocialLogin = async (provider: "google" | "discord") => {
    // Generate a beautiful simulated username and email
    const rand = Math.floor(Math.random() * 9000) + 1000;
    const name = `${provider.charAt(0).toUpperCase() + provider.slice(1)}User${rand}`;
    const email = `${provider}_user_${rand}@cluegrid.com`;
    const avatar = provider === "google" ? "🚀" : "👾";

    const res = await fetch("/api/user/mock-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username: name,
        avatar,
      }),
    });

    if (!res.ok) {
      throw new Error("Simulated social sign-in failed.");
    }

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("cluegrid_user_id", data.user.id);
      await refreshProfile();
    } else {
      throw new Error(data.error || "Simulated social sign-in failed.");
    }
  };

  const updateSettings = async (username: string, avatar: string) => {
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, avatar }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update profile settings");
    }

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
