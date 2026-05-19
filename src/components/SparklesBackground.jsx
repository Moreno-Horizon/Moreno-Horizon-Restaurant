import { useEffect, useState, memo } from "react";

function SparklesBackground() {
  const [sparkles, setSparkles] = useState([]);

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    // Generate 35 elegant glowing ambient floaters
    const list = Array.from({ length: 35 }).map((_, i) => {
      const size = Math.random() * 20 + 8; // size between 8px and 28px (soft glow)
      const left = Math.random() * 100;
      const delay = Math.random() * -30; // negative delay to start immediately pre-distributed
      const duration = Math.random() * 25 + 20; // ultra slow movement (20s to 45s)
      const opacity = Math.random() * 0.14 + 0.06; // soft, subtle presence
      return {
        id: i,
        size,
        left,
        delay,
        duration,
        opacity,
      };
    });
    setSparkles(list);
    
    // Mouse tracking for dynamic ambient glow
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[20] select-none">
      {/* Dynamic Ambient Glow tracking mouse */}
      <div 
        className="absolute top-0 left-0 w-[40rem] h-[40rem] rounded-full bg-gradient-to-r from-brand-orange/10 to-orange-400/5 dark:from-brand-orange/15 dark:to-orange-500/5 blur-[120px] pointer-events-none transition-all duration-1000 ease-out z-0 mix-blend-screen"
        style={{
          transform: `translate(${mousePos.x - 320}px, ${mousePos.y - 320}px)`,
        }}
      />
      <style>{`
        @keyframes float-ambient-sparkle {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-60vh) translateX(30px);
          }
          100% {
            transform: translateY(-120vh) translateX(-15px);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1) translate(0, 0);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.1) translate(30px, -20px);
          }
        }
        .ambient-sparkle {
          position: absolute;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0) 70%);
          border-radius: 50%;
          animation: float-ambient-sparkle linear infinite;
          will-change: transform;
        }
        .dark .ambient-sparkle {
          background: radial-gradient(circle, rgba(251, 146, 60, 0.45) 0%, rgba(251, 146, 60, 0) 70%);
        }
        .animate-pulse-slow {
          animation: pulse-slow 18s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Premium Luxury Background Ambient Orbs - Drifting glow circles */}
      <div className="absolute top-10 -left-48 w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-brand-orange/5 to-orange-500/0 dark:from-brand-orange/8 dark:to-orange-500/0 blur-[130px] mix-blend-screen animate-pulse-slow pointer-events-none" />
      <div className="absolute top-1/3 -right-60 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br from-orange-400/5 to-transparent dark:from-brand-orange/6 dark:to-transparent blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-48 -left-36 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-brand-orange/4 to-transparent dark:from-brand-orange/8 dark:to-transparent blur-[135px] mix-blend-screen animate-pulse-slow pointer-events-none" style={{ animationDelay: '-12s' }} />

      {/* Moving micro-sparkle lights */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="ambient-sparkle"
          style={{
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            left: `${sp.left}%`,
            bottom: `-40px`, // start below screen
            opacity: sp.opacity,
            animationDelay: `${sp.delay}s`,
            animationDuration: `${sp.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(SparklesBackground);
