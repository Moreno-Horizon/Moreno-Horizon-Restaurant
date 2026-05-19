import { useRef, useState } from "react";

const MagneticButton = ({ 
  children, 
  className = "", 
  onClick, 
  type = "button", 
  disabled = false, 
  isLoading = false 
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || isLoading) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.2; // 0.2 is the magnetic strength
    const y = (clientY - (top + height / 2)) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-300 ease-out cursor-pointer ${className} ${isLoading ? 'pointer-events-none' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Liquid Loading Effect */}
      {isLoading && (
        <div className="absolute inset-0 z-0 bg-brand-orange/80">
          <div className="liquid-progress-fill h-full w-full opacity-50 mix-blend-overlay"></div>
        </div>
      )}
      
      <span className={`relative z-10 flex items-center justify-center gap-2 ${isLoading ? 'opacity-90' : ''} transition-transform duration-300 ease-out`}
            style={{ transform: `translate(${position.x * 0.5}px, ${position.y * 0.5}px)` }}
      >
        {children}
      </span>
    </button>
  );
};

export default MagneticButton;
