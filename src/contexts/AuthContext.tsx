import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { toast } from "sonner";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  userType: string;
  profilePhoto?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  loading: boolean;
  checkAuth: () => Promise<void>;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  userType: string | null;
  setUserType: (type: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/check-auth", {
        withCredentials: true,
      });

      if (res.data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(res.data.user);
        setUserType(res.data.user.userType || null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
        setUserType(null);
      }
      // Silently ignore network errors (server might be starting up)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if coming back from Google OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get("oauth");

    if (oauthSuccess === "success") {
      // Clean query params from URL without causing a reload
      const url = new URL(window.location.href);
      url.searchParams.delete("oauth");
      url.searchParams.delete("role");
      window.history.replaceState({}, "", url.toString());

      checkAuth().then(() => {
        toast.success("Signed in with Google! 🎨");
      });
    } else {
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        loading,
        checkAuth,
        user,
        setUser,
        userType,
        setUserType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
