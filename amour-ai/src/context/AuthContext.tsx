import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  const signUpApp = async (data) => {
    try {
      const res = await axios.post("/api/auth/signup", data);

      if (res.status === 200) {
        setUser(res.data?.data);
        window.location.href = "/";
        toast({
          title: "Success",
          description: "Signup successful!",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: res.data?.error || "Signup failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Signup failed",
        variant: "destructive",
      });
    }
  };

  const loginApp = async (data) => {
    try {
      console.log(data);
      const res = await axios.post("/api/auth/login", data);

      if (res.status === 404 || !res.data?.ok) {
        throw new Error(res.data?.error || "Login failed");
      }
      if (res.data?.ok) {
        setUser(res.data?.data);
        window.location.href = "/";
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Login failed",
        variant: "destructive",
      });
      console.error("Login failed", err);
    }
  };

  const logOutApp = () => {
    setUser(null);
  };
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.status !== 200 || !res.data.ok) {
        setUser(null);
        return;
      }
      setUser(res.data?.data);
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loginApp, logOutApp, fetchUser, signUpApp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
