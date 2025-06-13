import React from 'react';

interface ProfileInfoProps {
  phoneNumber: string;
  personality: string;
  responseTime: number;
  notificationsEnabled: boolean;
}

export default function ProfileInfo({
  phoneNumber,
  personality,
  responseTime,
  notificationsEnabled,
}: ProfileInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Profile & AI Info
      </h3>
      <div className="mb-2">
        <span className="font-medium text-gray-700">Phone:</span>{" "}
        {phoneNumber}
      </div>
      <div className="mb-2">
        <span className="font-medium text-gray-700">AI Personality:</span>{" "}
        {personality}
      </div>
      <div className="mb-2">
        <span className="font-medium text-gray-700">Response Time:</span>{" "}
        {responseTime || "N/A"}s
      </div>
      <div className="mb-2">
        <span className="font-medium text-gray-700">Notifications:</span>{" "}
        {notificationsEnabled ? "On" : "Off"}
      </div>
    </div>
  );
} 