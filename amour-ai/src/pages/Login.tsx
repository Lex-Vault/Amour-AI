import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowRight, Lock, Sparkles, Zap, Phone, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Separate loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Countdown state & timer ref
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const { loginApp } = useAuth();

  // Manage countdown interval
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [secondsLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setSendingOtp(true);
    try {
      await axios.post("/api/auth/send-otp", { phone });
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone.",
        variant: "success",
      });
      setOtpSent(true);
      setSecondsLeft(60); // start 60s timeout after successful send
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !otp) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    setSigningIn(true);

    await loginApp({ phone, otp });
    

    setSigningIn(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#020202] overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[128px] pointer-events-none animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[128px] pointer-events-none animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg shadow-orange-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Continue your journey to dating dominance
          </p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                // lock phone input while sending OTP or while cooldown is active
                disabled={sendingOtp || (otpSent && secondsLeft > 0)}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
              />
            </div>

            {/* Send OTP Button */}
            <button
              type="button"
              onClick={handleSendOtp}
              // disabled while sending OR during cooldown
              disabled={sendingOtp || secondsLeft > 0}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/50 text-orange-300 hover:text-orange-200 font-semibold transition-all duration-300 hover:border-orange-500 hover:from-orange-500/30 hover:to-red-600/30 disabled:opacity-50"
            >
              {sendingOtp
                ? "Sending..."
                : secondsLeft > 0
                ? `Resend in ${secondsLeft}s`
                : "Send OTP"}
            </button>

            {/* OTP Input */}
            {otpSent && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all duration-300 text-center text-2xl tracking-widest font-mono"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signingIn || (!otpSent && !phone)}
              className="w-full group relative h-12 px-6 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300 border border-white/10 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4 w-1/2 h-full blur-md" />
              <span className="relative flex items-center justify-center gap-2">
                {signingIn ? "Signing In..." : "Log In"}
                {!signingIn && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
          </form>

          {/* Toggle Signup */}
          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">New to the game? </span>
            <button
              onClick={() => navigate("/signup")}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">Secure & Safe</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">Instant Access</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
            <Lock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-medium">Private Data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
