import { useRef, useState } from "react";

const TiltCard = ({ children, className = "", style = {} }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Calculate rotation: max 10 degrees, center is 0
    const rotateY = ((x / width) - 0.5) * 15; // Left/Right tilt
    const rotateX = ((y / height) - 0.5) * -15; // Up/Down tilt (inverted)

    setRotation({ x: rotateX, y: rotateY });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 });
      }}
      className={`relative ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Glossy reflection on hover */}
      {isHovering && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${rotation.y > 0 ? '70%' : '30%'} ${rotation.x > 0 ? '70%' : '30%'}, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`,
          }}
        />
      )}
      <div style={{ transform: isHovering ? 'translateZ(10px)' : 'translateZ(0px)', transition: 'transform 0.3s', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
