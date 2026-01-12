import { Button } from "@/components/ui/button";
import {
  PenTool,
  Camera,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturesSection = () => {
  const navigate = useNavigate();

  const profileTools = [
    {
      icon: PenTool,
      title: "Bio Generator",
      description: "Craft scroll‑stopping bios in seconds, tuned to your vibe.",
      path: "/tools/bio-generator",
      accent: "from-orange-500 to-red-500",
    },
    {
      icon: Camera,
      title: "DP Analyzer",
      description:
        "Audit your photos for lighting, composition, and attraction signals.",
      path: "/tools/dp-analyzer",
      accent: "from-pink-500 to-purple-500",
    },
    {
      icon: Lightbulb,
      title: "Expert Dating Advice",
      description:
        "Learn proven tactics to upgrade your entire dating presence.",
      path: null,
      accent: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-20 md:py-24 px-6 bg-[#101010] text-slate-50 font-sans overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-red-900/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-orange-700/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center md:mb-20 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500/80">
            Two Suites. Total Control.
          </p>
          {/* bg-gradient-to-r from-orange-400 to-red-600 */}
          <h2 className=" bg-clip-text text-3xl md:text-5xl font-bold section-title text-transparent">
            Profile Suite &amp; Chat War Room
          </h2>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-gray-400 leading-relaxed">
            First, sharpen how you show up. Then, command every conversation
            with AI‑backed intelligence.
          </p>
        </div>

        {/* Two main suites */}
        <div className="grid gap-10 md:grid-cols-2 items-stretch">
          {/* Profile Optimization Suite */}
          <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-[#1b0b0b] to-[#0c0c10] p-8 md:p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2b1515]">
                <PenTool className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500/80">
                  Profile Suite
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-50">
                  Make a First and Best impression
                </h3>
              </div>
            </div>

            <p className="mb-8 text-sm md:text-base text-gray-300 leading-relaxed">
              Everything you need to make your profile irresistible photos,
              bios, and strategy, all tuned by AI to match the kind of people
              you actually want.
            </p>

            {/* Individual profile tools */}
            <div className="space-y-4 ">
              {profileTools.map((tool, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => tool.path && navigate(tool.path)}
                  className={`group border-gray-700 flex w-full items-start gap-4 rounded-2xl border bg-white/5/5 p-4 text-left transition-all duration-300 ${
                    tool.path
                      ? "hover:border-orange-400/60 hover:bg-white/5 hover:-translate-y-1 cursor-pointer"
                      : "opacity-70 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center  rounded-xl bg-gradient-to-br ${tool.accent} bg-opacity-80`}
                  >
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-50">
                      {tool.title}
                      {!tool.path && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-300">
                          Coming soon
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs md:text-sm text-gray-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick characteristics */}
            <div className="mt-8 grid gap-3 text-xs md:text-sm text-gray-300 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Profile &amp; photo stack tuned by AI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Designed to attract your ideal matches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>No guesswork just clear, actionable upgrades</span>
              </div>
            </div>
          </div>

          {/* Chat Analyzer War Room */}
          <div className="relative flex flex-col rounded-3xl border border-white/10 bg-[#141416] p-8 md:p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,1)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#13201f]">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  Chat Analyzer
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-50">
                  Command every conversation
                </h3>
              </div>
            </div>

            <p className="mb-8 text-sm md:text-base text-gray-300 leading-relaxed">
              Paste any chat and step into a tactical “war room” that breaks
              down intent, flags risks, and hands you battle‑tested replies you
              can send instantly.
            </p>

            {/* Characteristics of Chat Analyzer */}
            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Red &amp; Green Flag Radar
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    Spot neediness, manipulation, or genuine interest before you
                    reply.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Intent Decoder
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    Translate vague messages into clear emotional intent and
                    likely next moves.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Response Architect
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    Generate Safe, Bold, or Witty replies that match your style
                    and the situation.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs md:text-sm text-gray-400">
                <p className="font-medium text-slate-100">
                  Live “war room” for your active chats.
                </p>
                <p>Paste, analyze, and reply in under a minute.</p>
              </div>

              <Button
                onClick={() => navigate("/tools/chat-analyzer")}
                className="mt-3 h-11 w-full rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/40 sm:mt-0 sm:w-auto"
              >
                Open Chat Analyzer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
