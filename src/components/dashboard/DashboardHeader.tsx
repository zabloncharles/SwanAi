import React from "react";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface DashboardHeaderProps {
  firstName: string;
}

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
          <UserCircleIcon className="w-10 h-10 text-gray-400" />
        </div>
        <div>
          {firstName && (
            <div className="font-bold text-2xl text-gray-900">{firstName}</div>
          )}
          <div className="text-sm text-gray-400">
            Welcome back to SwanAI <span className="ml-1">👋🏼</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded hover:bg-gray-100 transition">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 rounded hover:bg-gray-100 transition">
          <BellIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
