import React from "react";

interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
}

export const Beams: React.FC<BeamsProps> = ({
  beamWidth = 1,
  beamHeight,
  beamNumber,
  speed,
  noiseIntensity,
  scale,
  rotation,
}) => {
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
