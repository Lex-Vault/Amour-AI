import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

export default function LoveMeter({ value = 50 }) {
  const clamp = (v) => Math.max(0, Math.min(100, v));

  const ANIMATION_DELAY_MS = 1200; // wait before starting the visible animation
  const ANIMATION_DURATION_MS = 3000; // how slow the fill animates
  const HEART_TRANSITION_MS = 1000; // hearts scale/color transition duration

  const [targetValue, setTargetValue] = useState(clamp(value));
  const [displayValue, setDisplayValue] = useState(clamp(value));
  const delayRef = useRef(null);

  useEffect(() => {
    setTargetValue(clamp(value));

    if (delayRef.current) clearTimeout(delayRef.current);

    // longer delay before updating the displayed value
    delayRef.current = setTimeout(() => {
      setDisplayValue(clamp(value));
      delayRef.current = null;
    }, ANIMATION_DELAY_MS);

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
    };
  }, [value]);

  const getColor = (val) => {
    if (val < 25) return "from-pink-300 to-pink-400";
    if (val < 50) return "from-pink-400 to-pink-500";
    if (val < 75) return "from-red-400 to-red-500";
    return "from-red-500 to-red-600";
  };

  const heartClass = (level) =>
    displayValue >= level
      ? "text-red-500 fill-red-500 scale-110"
      : "text-gray-300";

  const heartLevels = [100, 75, 50, 25, 0];

  return (
    <div className="max-w-sm w-full bg-card/50 p-5 rounded-2xl shadow-lg pb-4 overflow-visible">
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-rose-200">
          {displayValue}% <span className="text-rose-400">Interest</span>
        </p>
      </div>

      <div className="flex items-end gap-6">
        <div className="relative flex items-end">
          {/* Labels */}
          <div className="absolute -right-24 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 h-64 pointer-events-none">
            <div>100</div>
            <div>75</div>
            <div>50</div>
            <div>25</div>
            <div>0</div>
          </div>

          {/* Tube (relative container) */}
          <div className="relative w-16 h-64">
            <div className="absolute inset-0 border-2 border-gray-200 rounded-full bg-white overflow-hidden shadow-inner" />

            {/* fill */}
            <div
              className={`absolute left-0 right-0 bottom-0 m-1 rounded-b-3xl ${
                value < 92 ? "rounded-t-lg" : "rounded-t-3xl"
              } wave-flow wave-bobing bg-gradient-to-t ${getColor(
                displayValue
              )}`}
              style={{
                height: `${displayValue}%`,
                transition: `height ${ANIMATION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${ANIMATION_DELAY_MS}ms, background ${ANIMATION_DURATION_MS}ms ease ${ANIMATION_DELAY_MS}ms`,
              }}
              aria-hidden
            />

            {/* ticks */}
            <div className="absolute inset-0 pointer-events-none">
              {[18, 36, 54, 72, 90].map((m) => (
                <div
                  key={m}
                  className="absolute left-1/2 w-[30%] -translate-x-1/2"
                  style={{ bottom: `${m}%` }}
                >
                  <div className="border-t border-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* bulb */}
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full border-4 border-gray-200 bg-gradient-to-b ${getColor(
              displayValue
            )} shadow-lg flex items-center justify-center`}
            style={{
              bottom: "-1.75rem",
              transition: `background ${ANIMATION_DURATION_MS}ms ease ${ANIMATION_DELAY_MS}ms, transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1) ${ANIMATION_DELAY_MS}ms`,
            }}
            aria-hidden
          >
            <Heart className="hover:scale-110 hover:fill-white transition-all duration-200" />
          </div>
        </div>

        {/* hearts */}
        <div className="h-64 flex flex-col justify-between ml-2">
          {heartLevels.map((level) => (
            <Heart
              key={level}
              size={28}
              className={`${heartClass(level)}`}
              aria-label={`Heart for ${level}`}
              // inline style to sync timing and delay with the fill animation
              style={{
                transition: `transform ${HEART_TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1) ${ANIMATION_DELAY_MS}ms, color ${HEART_TRANSITION_MS}ms ease ${ANIMATION_DELAY_MS}ms, fill ${HEART_TRANSITION_MS}ms ease ${ANIMATION_DELAY_MS}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline styles for the wave animation (keeps everything self-contained) */}
      <style>{`
      @keyframes wave{
        0% { transform: translateY(0); }
        100% { transform: translateY(-100%); }
      }
        @keyframes wave-bob{
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes wave-move-1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes wave-move-2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(25%); }
        }
        @keyframes wave-bob {
          0% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
          100% { transform: translateY(0); }
        }
          .wave-flow{
            animation: wave 10000ms linear infinite;
          }
            .wave-bobing{
              animation: wave-bob 1000ms ease-in-out infinite;
            }
        .wave-1 {
          will-change: transform;
          animation: wave-move-1 4000ms linear infinite, wave-bob 1800ms ease-in-out infinite;
        }
        .wave-2 {
          will-change: transform;
          animation: wave-move-2 6000ms linear infinite, wave-bob 3600ms ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-1, .wave-2 { animation: none; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
