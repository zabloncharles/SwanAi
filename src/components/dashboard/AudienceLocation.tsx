import React, { useState, useEffect, useRef } from "react";
import Globe from "react-globe.gl";

interface AudienceLocationProps {
  locationData: {
    lat: number;
    lng: number;
    altitude: number;
    color: string;
    count: number;
    name: string;
    size: number;
  }[];
}

export default function AudienceLocation({
  locationData,
}: AudienceLocationProps) {
  const globeEl = useRef<any>();
  const [globeWidth, setGlobeWidth] = useState(0);
  const [arcsData, setArcsData] = useState<any[]>([]);

  useEffect(() => {
    if (globeEl.current) {
      setGlobeWidth(globeEl.current.offsetWidth);
    }
    const handleResize = () => {
      if (globeEl.current) {
        setGlobeWidth(globeEl.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate arcs between locations
  useEffect(() => {
    if (locationData.length > 1) {
      const arcs: any[] = [];

      // Create arcs between consecutive locations
      for (let i = 0; i < locationData.length - 1; i++) {
        const start = locationData[i];
        const end = locationData[i + 1];

        arcs.push({
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          color: "#ef4444",
          altitude: 0.1,
          altitudeAutoScale: 0.5,
        });
      }

      // Create a few additional arcs for visual interest
      if (locationData.length > 2) {
        // Connect first and last location
        const first = locationData[0];
        const last = locationData[locationData.length - 1];
        arcs.push({
          startLat: first.lat,
          startLng: first.lng,
          endLat: last.lat,
          endLng: last.lng,
          color: "#3b82f6",
          altitude: 0.15,
          altitudeAutoScale: 0.5,
        });

        // Connect some random pairs for more connections
        if (locationData.length > 3) {
          arcs.push({
            startLat: locationData[0].lat,
            startLng: locationData[0].lng,
            endLat: locationData[2].lat,
            endLng: locationData[2].lng,
            color: "#10b981",
            altitude: 0.12,
            altitudeAutoScale: 0.5,
          });
        }
      }

      setArcsData(arcs);
    }
  }, [locationData]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm" ref={globeEl}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Audience Location
      </h3>
      {globeWidth > 0 && (
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          pointsData={locationData}
          pointLat="lat"
          pointLng="lng"
          pointAltitude="altitude"
          pointColor="color"
          pointRadius="size"
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcAltitude="altitude"
          arcAltitudeAutoScale="altitudeAutoScale"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcStroke={1}
          width={globeWidth}
          height={300}
          backgroundColor="rgba(255,255,255,0)"
        />
      )}
    </div>
  );
}
