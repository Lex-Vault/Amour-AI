import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, XCircle } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

export default function UserAvatar() {
  const { user, logOutApp, fetchUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initial = (user.username || "U").charAt(0).toUpperCase();
  const hasActiveSub = user.subscription?.status === "active";

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel your subscription? You will lose all remaining credits immediately.")) return;
    setCancelling(true);
    try {
      await axios.post("/api/payment/cancel-subscription");
      toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled and credits removed.", variant: "destructive" });
      fetchUser();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.error || "Failed to cancel", variant: "destructive" });
    } finally {
      setCancelling(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="absolute top-3 right-3 md:top-5 md:right-5 z-50">
      {/* Avatar Circle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform border-2 border-white/20 cursor-pointer select-none"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 backdrop-blur-xl bg-[#1a1a1a]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-gray-400 truncate">{user.phone}</p>
            {hasActiveSub && (
              <p className="text-xs text-emerald-400 mt-1">
                ✓ {user.subscription?.planKey?.replace("_", " ").replace(/^\w/, (c: string) => c.toUpperCase())} plan
              </p>
            )}
          </div>

          {hasActiveSub && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-white/10 transition-colors border-b border-white/10"
            >
              <XCircle className="w-4 h-4" />
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
          )}

          <button
            onClick={() => { setOpen(false); logOutApp(); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
