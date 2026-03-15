import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Plan configs (must match backend PLANS keys)
const weeklyPlans = [
  { key: "weekly_lite", name: "Lite", price: 49, credits: 12, features: ["All AI tools access", "Instant activation", "Auto-renews weekly"], cta: "Subscribe", popular: false },
  { key: "weekly_plus", name: "Plus", price: 149, credits: 35, features: ["All AI tools access", "Priority access", "Instant activation", "Auto-renews weekly"], cta: "Subscribe", popular: true },
  { key: "weekly_pro", name: "Pro", price: 299, credits: 70, features: ["All AI tools access", "Priority access", "Dedicated support", "Auto-renews weekly"], cta: "Subscribe", popular: false },
];

const monthlyPlans = [
  { key: "monthly_lite", name: "Lite", price: 199, credits: 50, features: ["All AI tools access", "Instant activation", "Auto-renews monthly"], cta: "Subscribe", popular: false },
  { key: "monthly_plus", name: "Plus", price: 499, credits: 160, features: ["All AI tools access", "Priority access", "Instant activation", "Auto-renews monthly"], cta: "Subscribe", popular: true },
  { key: "monthly_pro", name: "Pro", price: 999, credits: 350, features: ["All AI tools access", "Priority access", "Dedicated support", "Auto-renews monthly"], cta: "Subscribe", popular: false },
];

function loadRazorpayScript(src = "https://checkout.razorpay.com/v1/checkout.js") {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("window is undefined"));
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export default function RazorpayPaymentPricingUI() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedWeeklyIndex, setSelectedWeeklyIndex] = useState(0);
  const [selectedMonthlyIndex, setSelectedMonthlyIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { fetchUser } = useAuth();

  const handleSubscribe = async (plan: typeof weeklyPlans[0], index: number, billingPeriod: string) => {
    if (billingPeriod === "weekly") setSelectedWeeklyIndex(index);
    else setSelectedMonthlyIndex(index);

    setIsProcessing(true);
    try {
      // Create subscription on backend
      const createRes = await axios.post("/api/payment/create-subscription", {
        planKey: plan.key,
      });

      if (!createRes?.data?.ok) throw new Error(createRes?.data?.error || "failed_to_create_subscription");

      const { subscriptionId, key, amount, currency, name, description } = createRes.data.data;
      if (!subscriptionId) throw new Error("invalid_subscription_from_backend");

      await loadRazorpayScript();

      const options = {
        key,
        subscription_id: subscriptionId,
        amount,
        currency: currency || "INR",
        name: name || "Amour AI",
        description: description || `Subscribe to ${plan.name}`,
        handler: async function (razorResp: any) {
          try {
            toast({ title: "Subscription Activated! 🎉", description: `${plan.credits} credits added. Auto-renews ${billingPeriod}.`, variant: "success" as any });
            fetchUser();
            navigate("/", { replace: true });
          } catch (err) {
            console.error("post-subscription error", err);
          }
        },
        prefill: { name: "", email: "", contact: "" },
        notes: { planKey: plan.key, credits: String(plan.credits) },
        theme: { color: "#ea5810" },
        recurring: true,
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast({ title: "Payment failed", description: response?.error?.description || "Payment not completed", variant: "destructive" });
      });
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Subscription error", description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlanCard = (plan: typeof weeklyPlans[0], index: number, billingPeriod: string, selectedIndex: number, setSelectedIndex: (i: number) => void) => {
    const isSelected = index === selectedIndex;
    return (
      <div
        key={plan.key}
        onMouseEnter={() => setSelectedIndex(index)}
        onMouseLeave={() => setSelectedIndex(0)}
        className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 cursor-pointer max-w-[320px] w-full mx-auto
          ${plan.popular ? 'bg-[#161616] border-2 border-orange-500 shadow-[0_10px_50px_-20px_rgba(234,88,12,0.45)] scale-105' : isSelected ? 'bg-[#171717] scale-105 border border-white/10 shadow-lg' : 'bg-[#141414] border border-white/5'}`}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Most Popular</div>
          </div>
        )}

        <div className="text-center mb-4 pt-6">
          <h4 className="text-xl font-bold mb-2 text-white">{plan.name}</h4>

          <div className="mb-2">
            <span className="text-4xl font-bold text-white">₹{plan.price}</span>
            <p className="text-xs text-gray-400">per {billingPeriod === "weekly" ? "week" : "month"}</p>
          </div>

          <div>
            <span className="text-3xl font-bold text-purple-400">{plan.credits}</span>
            <p className="text-gray-400 text-sm mt-1">Credits / cycle</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 flex-grow mt-3">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
              <svg className="w-4 h-4 mt-1 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Auto-renew badge */}
        <div className="flex items-center justify-center gap-1.5 mb-3 text-xs text-emerald-400">
          <RefreshCw className="w-3 h-3" />
          <span>Auto-renews {billingPeriod}</span>
        </div>

        <Button
          onClick={() => handleSubscribe(plan, index, billingPeriod)}
          className={`w-full py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-0' : 'bg-[#0b0b0b] border border-white/10 text-gray-300 hover:border-orange-500/30 hover:text-white hover:bg-[#1a1a1a]'}`}
          disabled={isProcessing}
        >
          {isProcessing && index === selectedIndex ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4 inline-block" /> {plan.cta}
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <section id="pricing" className="py-24 bg-[#070707] relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-[520px] h-[520px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-orange-400 pb-2">Choose Your Plan</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">Subscribe and get credits auto-renewed every cycle. Cancel anytime.</p>
        </div>

        {/* Weekly Section */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-lg mb-2 font-semibold tracking-wide">Weekly Plans</span>
            <p className="text-sm text-gray-400">Auto-renews every week. Credits refresh each cycle.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {weeklyPlans.map((plan, index) => renderPlanCard(plan, index, "weekly", selectedWeeklyIndex, setSelectedWeeklyIndex))}
          </div>
        </div>

        {/* Monthly Section */}
        <div className="mt-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-lg mb-2 font-semibold tracking-wide">Monthly Plans</span>
            <p className="text-sm text-gray-400">Auto-renews every month. Best value for regular users.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {monthlyPlans.map((plan, index) => renderPlanCard(plan, index, "monthly", selectedMonthlyIndex, setSelectedMonthlyIndex))}
          </div>
        </div>
      </div>
    </section>
  );
}
