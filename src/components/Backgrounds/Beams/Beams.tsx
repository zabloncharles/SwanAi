import React from "react";

interface BeamsProps {
  beamWidth?: number;
}

export const Beams: React.FC<BeamsProps> = ({ beamWidth = 1 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30"
        style={{
          width: `${beamWidth * 100}%`,
          transform: "translateX(-50%)",
          left: "50%",
        }}
      />
    </div>
  );
};
