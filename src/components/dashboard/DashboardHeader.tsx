import React, { useState, useRef } from "react";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface DashboardHeaderProps {
  firstName: string;
}

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
      <div className="flex items-center gap-2 relative">
        <button className="p-2 rounded hover:bg-gray-100 transition" aria-label="Notifications">
          <BellIcon className="w-5 h-5 text-gray-400" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition flex items-center gap-2"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="User menu"
          >
            <UserCircleIcon className="w-7 h-7 text-gray-400" />
            <span className="hidden md:inline text-gray-700 font-medium">{firstName || "User"}</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                <Cog6ToothIcon className="w-5 h-5" />
                Profile & Settings
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
