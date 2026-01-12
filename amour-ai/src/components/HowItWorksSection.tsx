import { Upload, Brain, Target } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Input Your Details",
    description:
      "Share your photos, preferences, and dating goals with our secure platform.",
  },
  {
    icon: Brain,
    title: "Our AI Analyzes",
    description:
      "Advanced algorithms process your information to identify optimization opportunities.",
  },
  {
    icon: Target,
    title: "Get Your Results",
    description:
      "Receive personalized recommendations and improvements to transform your dating success.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent pb-2">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Three simple steps to transform your dating profile and boost your
            match potential.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 z-0" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Icon Circle */}
              <div className="relative z-10 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-[#151515] border border-white/5 flex items-center justify-center shadow-2xl group-hover:border-orange-500/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_-10px_rgba(234,88,12,0.3)]">
                  <step.icon className="w-10 h-10 text-orange-500 group-hover:text-red-500 transition-colors duration-300" />
                </div>
                {/* Step Number Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-orange-500/30 text-xs font-bold text-orange-500 shadow-lg">
                  STEP 0{index + 1}
                </div>
              </div>

              {/* Text Content */}
              <div className="mt-4 px-4">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-50 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
