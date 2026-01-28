import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  fetchUser: () => Promise<void>;
  signUpApp: (data: { username: string; phone: string; otp: string; ref?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth/me");
      if (res.status === 200 && res.data?.ok) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on initial mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signUpApp = async (data: { username: string; phone: string; otp: string; ref?: string }) => {
    try {
      const res = await axios.post("/api/auth/signup", data);

      if (res.status === 200 && res.data?.ok) {
        setUser(res.data.data);
        toast({
          title: "Success",
          description: "Signup successful!",
          variant: "default",
        });
        // Use setTimeout to ensure state is updated before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
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
        setUser(res.data.data);
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default",
        });
        // Use setTimeout to ensure state is updated before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
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
    setUser(null);
    window.location.href = "/login";
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

