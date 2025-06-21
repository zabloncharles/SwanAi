import React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";

interface UserTypeData {
  active: number;
  new: number;
  inactive: number;
}

interface UserTypesProps {
  usersByDay: { [date: string]: number };
}

export default function UserTypes({ usersByDay }: UserTypesProps) {
  // Calculate user types from real data
  const calculateUserTypes = (): UserTypeData => {
    const dates = Object.keys(usersByDay).sort();
    const totalUsers = Object.values(usersByDay).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalUsers === 0) {
      return { active: 0, new: 0, inactive: 0 };
    }

    // Get the most recent date
    const mostRecentDate = dates[dates.length - 1];
    const recentUsers = usersByDay[mostRecentDate] || 0;

    // Calculate new users (users from the most recent day)
    const newUsers = recentUsers;

    // Calculate active users (users from the last 7 days)
    const last7Days = dates.slice(-7);
    const activeUsers = last7Days.reduce(
      (sum, date) => sum + (usersByDay[date] || 0),
      0
    );

    // Calculate inactive users (total - active)
    const inactiveUsers = Math.max(0, totalUsers - activeUsers);

    return {
      active: activeUsers,
      new: newUsers,
      inactive: inactiveUsers,
    };
  };

  const userTypeData = calculateUserTypes();
  const total = userTypeData.active + userTypeData.new + userTypeData.inactive;

  // Avoid division by zero
  const activePercentage =
    total > 0 ? Math.round((userTypeData.active / total) * 100) : 0;
  const newPercentage =
    total > 0 ? Math.round((userTypeData.new / total) * 100) : 0;
  const inactivePercentage =
    total > 0 ? Math.round((userTypeData.inactive / total) * 100) : 0;

  const getPrimaryUserType = () => {
    if (activePercentage >= 40)
      return {
        label: "Active",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (newPercentage >= 35)
      return { label: "New", color: "text-blue-600", bgColor: "bg-blue-100" };
    return {
      label: "Inactive",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };
  };

  const primaryUserType = getPrimaryUserType();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">User Types</h3>
        <UsersIcon className="h-5 w-5 text-gray-400" />
      </div>

      {/* Primary user type */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {activePercentage}%
        </div>
        <div
          className={`text-sm font-semibold px-3 py-1 rounded-full ${primaryUserType.bgColor} ${primaryUserType.color}`}
        >
          {primaryUserType.label}
        </div>
      </div>

      {/* User type breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Active Users</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {activePercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${activePercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">New Users</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {newPercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${newPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Inactive Users</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {inactivePercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${inactivePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Total users */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-lg font-semibold text-gray-900">
            {total.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
