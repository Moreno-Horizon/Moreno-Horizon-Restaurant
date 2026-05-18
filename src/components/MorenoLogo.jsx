import React from "react";

export const MorenoLogo = ({ scale = 1, className = "" }) => (
  <div
    className={`flex flex-col items-center text-center select-none ${className}`}
    style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
  >
    <img
      src="/logo.webp"
      alt="Moreno SPA & RESORT"
      className="w-32 md:w-40 h-auto object-contain drop-shadow-sm"
      loading="lazy"
    />
  </div>
);

export default MorenoLogo;
