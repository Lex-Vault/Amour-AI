import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  Lock,
  Sparkles,
  Heart,
} from "lucide-react";
import heroBg from "@/assets/hero-bg-romantic1.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();
  const router = useNavigate();
  return (
    <section className="relative pt-10 md:mt-0 min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020202]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={heroBg}
          alt="Background"
          className="w-full h-full object-cover scale-110 animate-slow-pan"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5C001C] via-[#020202] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b via-transparent to-[#020202]/20" />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[128px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[128px] pointer-events-none animate-pulse-slow delay-1000" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="hero-title pb-6 ">
          💕 Your Profile, <span className="text-red">Perfected.</span>
          <br />
          <span className="text-accent ">Find Your Match Faster.</span>
        </h1>
        {/* Subheadline */}
        <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mb-12">
          Stop relying on luck. Use Amour AI to analyze your chats, optimize
          your photos, and craft bios that psychologically trigger attraction.
          <span className="block mt-2 text-gray-500 text-base font-medium">
            Your personal dating war room is ready.
          </span>
        </p>
        {user ? (
          <div>
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 text-lg md:text-2xl text-orange-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12">
              Welcome back,{" "}
              <span className="font-semibold">{user.username}</span>!
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto mb-20">
            <Button
              onClick={() => router("/signup")}
              className="group relative h-14 px-10 min-w-[200px] text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_60px_-10px_rgba(234,88,12,0.6)] hover:scale-[1.02] transition-all duration-300 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4 w-1/2 h-full blur-md" />
              <span className="relative flex items-center gap-2">
                Sign Up / Login{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        )}

        {/* Feature Highlights (Replaces Stats) */}
        <div className="animate-in fade-in duration-1000 delay-500 w-full pt-10 border-t border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-sm font-semibold text-gray-300">
                AI-Powered
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Analysis Engine
              </span>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-gray-300">
                100% Private
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Zero Data Sharing
              </span>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-sm font-semibold text-gray-300">
                Instant Results
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Real-time Feedback
              </span>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-sm font-semibold text-gray-300">
                Match Focused
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Higher Conversion
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
          @keyframes slowPan {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1.1); }
          }
          .animate-slow-pan {
            animation: slowPan 20s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
    </section>
  );
};

export default HeroSection;
