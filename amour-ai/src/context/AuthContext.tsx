import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "amour_token";

interface User {
  id: string;
  username: string;
  phone: string;
  phoneVerified: boolean;
  credits?: number;
  adminAccess?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginApp: (data: { phone: string; otp: string }) => Promise<void>;
  logOutApp: () => Promise<void>;
  fetchUser: () => Promise<User | null>;
  signUpApp: (data: { username: string; phone: string; otp: string; ref?: string; gender?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to manage token
const setSession = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const initialLoadDone = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      // Only show loading spinner on initial load, not on refresh
      // This prevents ProtectedRoute from unmounting/remounting pages
      if (!initialLoadDone.current) setLoading(true);
      const res = await axios.get("/api/auth/me");
      if (res.status === 200 && res.data?.ok) {
        const userData = res.data.data;
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setSession(storedToken);
    }
    fetchUser();
  }, [fetchUser]);

  const signUpApp = async (data: { username: string; phone: string; otp: string; ref?: string; gender?: string }) => {
    try {
      const res = await axios.post("/api/auth/signup", data);

      if (res.status === 200 && res.data?.ok) {
        const { token, ...userData } = res.data.data;
        
        // Save token to localStorage and axios headers
        if (token) {
          setSession(token);
        }

        setUser(userData);
        
        // Verify session (now checking header-based auth too)
        const verifiedUser = await fetchUser();
        
        if (verifiedUser) {
          toast({
            title: "Success",
            description: "Signup successful!",
            variant: "default",
          });
          window.location.href = "/";
        } else {
          // This should almost never happen with Hybrid Auth
          setUser(null);
          toast({
            title: "Session Error",
            description: "Could not verify session. Please try logging in again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: res.data?.error || "Signup failed",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Signup failed",
        variant: "destructive",
      });
    }
  };

  const loginApp = async (data: { phone: string; otp: string }) => {
    try {
      const res = await axios.post("/api/auth/login", data);

      if (res.status === 404 || !res.data?.ok) {
        throw new Error(res.data?.error || "Login failed");
      }

      if (res.data?.ok) {
        const { token, ...userData } = res.data.data;

         // Save token to localStorage and axios headers
         if (token) {
          setSession(token);
        }

        setUser(userData);

        // Verify session persistence
        const verifiedUser = await fetchUser();

        if (verifiedUser) {
          toast({
            title: "Success",
            description: "Login successful!",
            variant: "default",
          });
          navigate("/");
        } else {
           // With token in localStorage, this is very unlikely unless API failure
           setUser(null);
           toast({
             title: "Session Error",
             description: "Login succeeded but session verification failed. Please try again.",
             variant: "destructive",
           });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || err?.message || "Login failed",
        variant: "destructive",
      });
      console.error("Login failed", err);
    }
  };

  const logOutApp = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      // Ignore logout errors
    }
    setSession(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginApp, logOutApp, fetchUser, signUpApp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

