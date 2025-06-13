import React from 'react';
import {
  HomeIcon,
  InboxIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
}

const mainNav = [
  { label: "Overview", icon: HomeIcon },
  { label: "Messages", icon: InboxIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];

const salesChannels = [{ label: "Vonage", icon: GlobeAltIcon }];

export default function DashboardSidebar({ activeTab, setActiveTab, onSignOut }: DashboardSidebarProps) {
  return (
    <aside className="w-64 flex flex-col border-r border-gray-100 bg-white py-6 px-4 min-h-screen sticky top-0 h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div>
            <div className="font-bold text-lg text-gray-900 leading-tight">
              Dashboard
            </div>
            <div className="text-xs text-gray-400">SMS Assistant</div>
          </div>
        </div>
        <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
          MAIN
        </div>
        <nav className="space-y-1 mb-6">
          {mainNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors relative ${
                label === activeTab
                  ? "bg-gray-100 text-indigo-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(label)}
            >
              <span
                className={`absolute left-0 top-0 h-full w-1 rounded bg-indigo-500 transition-all ${
                  label === activeTab
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-50"
                }`}
              ></span>
              <Icon className="w-5 h-5" />
              {label}
              {label === activeTab && (
                <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-400" />
              )}
            </button>
          ))}
        </nav>
        <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
          INTEGRATIONS
        </div>
        <nav className="space-y-1 mb-6">
          {salesChannels.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-gray-700 hover:bg-gray-50"
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
          <button
            onClick={onSignOut}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-red-600 hover:bg-red-50"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
} 