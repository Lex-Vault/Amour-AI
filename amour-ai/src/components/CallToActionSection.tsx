import {
  Heart,
  Sparkles,
  Github,
  Twitter,
  Instagram,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const CallToActionSection = () => {
  return (
    <section className="relative py-32 md:py-40 bg-[#020202] overflow-hidden border-b border-white/5">
      {/* Cinematic Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020202] to-[#020202]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Animated Icon Container */}
        <div className="mb-12 inline-flex items-center justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full group-hover:bg-red-500/30 transition-all duration-700" />
            <div className="relative p-6 rounded-full bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm shadow-2xl">
              <Heart className="w-16 h-16 text-red-500 fill-red-500/10 animate-pulse-slow" />
            </div>
          </div>
        </div>

        {/* Main Statement */}
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
          Love is not luck. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x">
            It's a Science.
          </span>
        </h2>

        {/* Supporting Text */}
        <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
          Your journey to meaningful connection starts with optimizing how you
          present your authentic self.
          <span className="text-gray-300 font-normal">
            {" "}
            Welcome to the future of dating.
          </span>
        </p>

        {/* Minimalist Trust Indicator */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-sm text-gray-500 uppercase tracking-widest font-medium">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Trusted by 10,000+ Singles</span>
        </div>
      </div>

      <style>{`
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#020202] pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 border-b border-white/5 pb-20">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <p className="text-gray-500 max-w-sm leading-relaxed text-base font-light">
              Designing the intersection of artificial intelligence and human
              connection. We build tools that help you be seen, understood, and
              loved.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-semibold text-white mb-8 text-lg">Services</h4>
            <ul className="space-y-6">
              {[
                { name: "Profile Suite", href: "#features" },
                { name: "Chat War Room", href: "#features" },
                { name: "Photo Analyzer", href: "#features" },
                { name: "Pricing", href: "#pricing" },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}  
                    className="text-gray-500 hover:text-white transition-colors text-sm font-medium flex items-center group"
                  >
                    {item.name}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-white mb-8 text-lg">Connect with Us</h4>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-3 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600 font-medium uppercase tracking-wide">
          <p>© {new Date().getFullYear()} Amour AI Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-400 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { CallToActionSection, Footer };
