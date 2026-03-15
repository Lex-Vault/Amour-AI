/**
 * One-time script to create Razorpay Subscription Plans.
 * Run: node scripts/createRazorpayPlans.js
 *
 * Creates 6 plans (3 weekly + 3 monthly) and prints their IDs.
 * Save the plan IDs — they are used by the subscription controller.
 */
import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const plans = [
  { name: "Weekly Lite",    amount: 4900,  period: "weekly",  interval: 1, credits: 12 },
  { name: "Weekly Plus",    amount: 14900, period: "weekly",  interval: 1, credits: 35 },
  { name: "Weekly Pro",     amount: 29900, period: "weekly",  interval: 1, credits: 70 },
  { name: "Monthly Lite",   amount: 19900, period: "monthly", interval: 1, credits: 50 },
  { name: "Monthly Plus",   amount: 49900, period: "monthly", interval: 1, credits: 160 },
  { name: "Monthly Pro",    amount: 99900, period: "monthly", interval: 1, credits: 350 },
];

async function createPlans() {
  console.log("Creating Razorpay Plans...\n");

  const results = [];

  for (const plan of plans) {
    try {
      const created = await razorpay.plans.create({
        period: plan.period,
        interval: plan.interval,
        item: {
          name: plan.name,
          amount: plan.amount, // paise
          currency: "INR",
          description: `${plan.credits} credits - ${plan.name}`,
        },
        notes: {
          credits: String(plan.credits),
        },
      });

      console.log(`✅ ${plan.name}: ${created.id}`);
      results.push({ name: plan.name, id: created.id, credits: plan.credits });
    } catch (err) {
      console.error(`❌ ${plan.name}: ${err.error?.description || err.message}`);
    }
  }

  console.log("\n--- Save these plan IDs in your subscription controller ---");
  console.log(JSON.stringify(results, null, 2));
}

createPlans();
