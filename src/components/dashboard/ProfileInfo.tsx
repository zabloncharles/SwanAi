import React from 'react';
import {
  PhoneIcon,
  UserCircleIcon,
  ClockIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface ProfileInfoProps {
  phoneNumber: string;
  personality: string;
  responseTime: number;
  notificationsEnabled: boolean;
  aiRelationship?: string;
  type?: string;
}

export default function ProfileInfo({
  phoneNumber,
  personality,
  responseTime,
  notificationsEnabled,
  aiRelationship,
  type,
}: ProfileInfoProps) {
  const infoItems = [
    {
      icon: PhoneIcon,
      label: "Phone Number",
      value: phoneNumber || "Not set",
    },
    {
      icon: UserCircleIcon,
      label: "AI Personality",
      value: personality || "Professional",
    },
    ...(type === 'pro' || type === 'ultimate' || type === 'admin'
      ? [{
          icon: UserCircleIcon,
          label: "AI Relationship",
          value: aiRelationship && aiRelationship.trim() !== '' ? aiRelationship : "Not selected yet",
        }]
      : []),
    {
      icon: ClockIcon,
      label: "Average Response Time",
      value: `${Math.round(responseTime)}ms`,
    },
    {
      icon: BellIcon,
      label: "Notifications",
      value: notificationsEnabled ? "Enabled" : "Disabled",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <item.icon className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 