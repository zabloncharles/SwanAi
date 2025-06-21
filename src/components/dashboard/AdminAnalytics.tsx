// This file will be refactored to use the new dashboard design.

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  UsersIcon,
  HeartIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import SimpleStatCard from "./SimpleStatCard";
import CtrChart from "./CtrChart";
import AudienceLocation from "./AudienceLocation";
import UserTypes from "./SentimentAnalysis";

interface AdminAnalyticsProps {
  usersByDay: { [date: string]: number };
  tokensByDay: { [date: string]: number };
  messagesByDay: { [date: string]: number };
  remainingBalance?: number;
}

export default function AdminAnalytics({
  usersByDay,
  messagesByDay,
  tokensByDay,
  remainingBalance,
}: AdminAnalyticsProps) {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [locationData, setLocationData] = useState<any[]>([]);

  useEffect(() => {
    setTotalUsers(
      Object.values(usersByDay).reduce((sum, count) => sum + count, 0)
    );
    setTotalMessages(
      Object.values(messagesByDay).reduce((sum, count) => sum + count, 0)
    );
    setTotalTokens(
      Object.values(tokensByDay).reduce((sum, count) => sum + count, 0)
    );

    async function fetchLocationData() {
      const analyticsRef = collection(db, "analytics");
      const snapshot = await getDocs(analyticsRef);
      const locations: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.locationData && Array.isArray(data.locationData)) {
          locations.push(...data.locationData);
        }
      });
      setLocationData(locations);
    }
    fetchLocationData();
  }, [usersByDay, messagesByDay, tokensByDay]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 rounded-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <SimpleStatCard
            label="All Users"
            value={totalUsers}
            percentageChange={25}
            Icon={UsersIcon}
          />
          <SimpleStatCard
            label="Likes"
            value={totalMessages}
            percentageChange={32}
            Icon={HeartIcon}
          />
          <SimpleStatCard
            label="Tokens Used"
            value={totalTokens}
            percentageChange={18}
            Icon={CurrencyDollarIcon}
          />
          {remainingBalance !== undefined && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Vonage Balance
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Current SMS services balance
              </p>
              <div className="text-3xl font-bold text-green-600">
                ${remainingBalance.toFixed(4)}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-5">
              <CtrChart data={tokensByDay} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <AudienceLocation locationData={locationData} />
            </div>
            <div className="md:col-span-2 space-y-6">
              <UserTypes usersByDay={usersByDay} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
