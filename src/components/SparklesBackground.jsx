import { useEffect, useState, memo } from "react";

function SparklesBackground() {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate 30 elegant glowing ambient floaters
    const list = Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 24 + 8; // size between 8px and 32px (soft glow)
      const left = Math.random() * 100;
      const delay = Math.random() * -20; // negative delay to start immediately pre-distributed
      const duration = Math.random() * 20 + 20; // ultra slow movement (20s to 40s)
      const opacity = Math.random() * 0.12 + 0.06; // soft, subtle presence
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[20] select-none">
      <style>{`
        @keyframes float-ambient-sparkle {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-60vh) translateX(25px);
          }
          100% {
            transform: translateY(-120vh) translateX(-10px);
          }
        }
        .ambient-sparkle {
          position: absolute;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(249, 115, 22, 0) 70%);
          border-radius: 50%;
          animation: float-ambient-sparkle linear infinite;
          will-change: transform;
        }
        .dark .ambient-sparkle {
          background: radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, rgba(251, 146, 60, 0) 70%);
        }
      `}</style>
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
