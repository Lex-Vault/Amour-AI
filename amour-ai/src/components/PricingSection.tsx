import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Updated plans: supports Weekly and Monthly pricing tiers as requested.
// Weekly: Lite ₹49 (12 credits), Plus ₹149 (35 credits), Pro ₹299 (70 credits)
// Monthly: Lite ₹199 (50 credits), Plus ₹499 (160 credits), Pro ₹999 (350 credits)

const weeklyPlans = [
  { name: "Lite", price: 49, credits: 12, features: ["All AI tools access", "Instant activation"], cta: "Buy Now", popular: false },
  { name: "Plus", price: 149, credits: 35, features: ["All AI tools access", "Priority access", "Instant activation"], cta: "Buy Now", popular: true },
  { name: "Pro", price: 299, credits: 70, features: ["All AI tools access", "Priority access", "Dedicated support"], cta: "Buy Now", popular: false },
];

const monthlyPlans = [
  { name: "Lite", price: 199, credits: 50, features: ["All AI tools access", "Instant activation"], cta: "Buy Now", popular: false },
  { name: "Plus", price: 499, credits: 160, features: ["All AI tools access", "Priority access", "Instant activation"], cta: "Buy Now", popular: true },
  { name: "Pro", price: 999, credits: 350, features: ["All AI tools access", "Priority access", "Dedicated support"], cta: "Buy Now", popular: false },
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

  const handleBuy = async (plan, index, billingPeriod = "weekly") => {
    if (billingPeriod === "weekly") setSelectedWeeklyIndex(index);
    else setSelectedMonthlyIndex(index);

    setIsProcessing(true);
    try {
      const createRes = await axios.post("/api/payment/create-order", {
        amount: plan.price,
        currency: "INR",
        credits: plan.credits,
        description: `${plan.credits} credits - ${plan.name} (${billingPeriod})`,
      });

      if (!createRes?.data?.success) throw new Error(createRes?.data?.error || "failed_to_create_order");

      const order = createRes.data.order;
      if (!order || !order.id) throw new Error("invalid_order_from_backend");

      await loadRazorpayScript();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || createRes.data.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Amour AI",
        description: `Buy ${plan.credits} credits (${billingPeriod})`,
        order_id: order.id,
        handler: async function (razorResp) {
          try {
            const verifyRes = await axios.post("/api/payment/verify-payment", {
              razorpay_payment_id: razorResp.razorpay_payment_id,
              razorpay_order_id: razorResp.razorpay_order_id,
              razorpay_signature: razorResp.razorpay_signature,
              amountRupees: plan.price,
            });

            if (!verifyRes?.data?.success) {
              toast({ title: "Verification failed", description: verifyRes?.data?.error || "Could not verify payment", variant: "destructive" });
              return;
            }

            toast({ title: "Payment Success", description: `Credited ${plan.credits} credits`, variant: "success" });
            fetchUser();
            navigate("/", { replace: true });
          } catch (err) {
            console.error("verification error", err);
            toast({ title: "Verification error", description: "Failed to confirm payment. Contact support.", variant: "destructive" });
          }
        },
        prefill: { name: "", email: "", contact: "" },
        notes: { credits: String(plan.credits), billingPeriod },
        theme: { color: "#ea5810" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast({ title: "Payment failed", description: response?.error?.description || "Payment not completed", variant: "destructive" });
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast({ title: "Payment error", description: (err && err.message) || "Something went wrong", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-[#070707] relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-[520px] h-[520px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-orange-400 pb-2">Choose Your Plan</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">Select the perfect toolkit to accelerate your success and get credits instantly.</p>
        </div>

        {/* Weekly Section - shown first */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-lg mb-2 font-semibold tracking-wide">Weekly Packs</span>
            <p className="text-sm text-gray-400">Billed every week. Short-term access and flexibility.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {weeklyPlans.map((plan, index) => {
              const isSelected = index === selectedWeeklyIndex;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedWeeklyIndex(index)}
                  onMouseLeave={() => setSelectedWeeklyIndex(0)}
                  className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 cursor-pointer max-w-[320px] w-full mx-auto
                    ${plan.popular ? 'bg-[#161616] border-2 border-orange-500 shadow-[0_10px_50px_-20px_rgba(234,88,12,0.45)] scale-105' : isSelected ? 'bg-[#171717] scale-105 border border-white/10 shadow-lg' : 'bg-[#141414] border border-white/5'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Most Popular</div>
                    </div>
                  )}

                  <div className="text-center mb-4 pt-6">
                    <h4 className={`text-xl font-bold mb-2 text-white`}>{plan.name}</h4>

                    <div className="mb-2">
                      <span className={`text-4xl font-bold text-white`}>₹{plan.price}</span>
                      <p className="text-xs text-gray-400">per week</p>
                    </div>

                    <div>
                      <span className={`text-3xl font-bold text-purple-400`}>{plan.credits}</span>
                      <p className="text-gray-400 text-sm mt-1">Credits</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-grow mt-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                        <svg className={`w-4 h-4 mt-1 text-gray-400`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBuy({ ...plan, name: `${plan.name} (weekly)` }, index, "weekly")}
                    className={`w-full py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-0' : 'bg-[#0b0b0b] border border-white/10 text-gray-300 hover:border-orange-500/30 hover:text-white hover:bg-[#1a1a1a]'}`}
                    disabled={isProcessing}
                  >
                    {isProcessing && index === selectedWeeklyIndex ? (
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
            })}
          </div>
        </div>

        {/* Monthly Section - shown below weekly */}
        <div className="mt-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-lg mb-2 font-semibold tracking-wide">Monthly Packs</span>
            <p className="text-sm text-gray-400">Billed every month. Best for ongoing usage and savings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {monthlyPlans.map((plan, index) => {
              const isSelected = index === selectedMonthlyIndex;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setSelectedMonthlyIndex(index)}
                  onMouseLeave={() => setSelectedMonthlyIndex(0)}
                  className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 cursor-pointer max-w-[320px] w-full mx-auto
                    ${plan.popular ? 'bg-[#161616] border-2 border-orange-500 shadow-[0_10px_50px_-20px_rgba(234,88,12,0.45)] scale-105' : isSelected ? 'bg-[#171717] scale-105 border border-white/10 shadow-lg' : 'bg-[#141414] border border-white/5'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">Most Popular</div>
                    </div>
                  )}

                  <div className="text-center mb-4 pt-6">
                    <h4 className={`text-xl font-bold mb-2 text-white`}>{plan.name}</h4>

                    <div className="mb-2">
                      <span className={`text-4xl font-bold text-white`}>₹{plan.price}</span>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>

                    <div>
                      <span className={`text-3xl font-bold text-purple-400`}>{plan.credits}</span>
                      <p className="text-gray-400 text-sm mt-1">Credits</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-grow mt-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                        <svg className={`w-4 h-4 mt-1 text-gray-400`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBuy({ ...plan, name: `${plan.name} (monthly)` }, index, "monthly")}
                    className={`w-full py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg border-0' : 'bg-[#0b0b0b] border border-white/10 text-gray-300 hover:border-orange-500/30 hover:text-white hover:bg-[#1a1a1a]'}`}
                    disabled={isProcessing}
                  >
                    {isProcessing && index === selectedMonthlyIndex ? (
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
