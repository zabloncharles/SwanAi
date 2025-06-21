import React, { useState } from "react";
import {
  HomeIcon,
  InboxIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "../../components/UserContext";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
}

const mainNav = [
  { label: "Overview", icon: HomeIcon },
  { label: "Messages", icon: InboxIcon },
  { label: "Settings", icon: Cog6ToothIcon },
  { label: "Pricing", icon: CurrencyDollarIcon },
];

const salesChannels = [{ label: "Vonage", icon: GlobeAltIcon }];

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  onSignOut,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userData } = useUser();

  const renderNav = () => (
    <nav className="space-y-1 mb-6">
      {mainNav.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors relative ${
            label === activeTab
              ? "bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => {
            setActiveTab(label);
            setMobileOpen(false);
          }}
          title={label}
        >
          <span
            className={`absolute left-0 top-0 h-full w-1 rounded bg-blue-600 transition-all ${
              label === activeTab
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-50"
            }`}
          ></span>
          <Icon className="w-5 h-5" />
          {!collapsed && label}
          {label === activeTab && !collapsed && (
            <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-400" />
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`z-50 w-64 flex flex-col border-r border-gray-100 bg-white py-6 px-4 min-h-screen sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? "w-20 px-2" : "w-64 px-4"
        } ${mobileOpen ? "fixed left-0 top-0 h-full" : "hidden md:flex"}`}
      >
        <div className="flex items-center gap-3 mb-8">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
          </button>
          <div>
            <div className="font-bold text-lg text-gray-900 leading-tight">
              {!collapsed && "Dashboard"}
            </div>
            {!collapsed && (
              <div className="text-xs text-gray-400">
                {userData?.type
                  ? userData.type.charAt(0).toUpperCase() +
                    userData.type.slice(1)
                  : "User"}
              </div>
            )}
          </div>
          <button
            className="ml-auto p-2 rounded hover:bg-gray-100 hidden md:block"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
          {!collapsed && "MAIN"}
        </div>
        {renderNav()}
        <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
          {!collapsed && "INTEGRATIONS"}
        </div>
        <nav className="space-y-1 mb-6">
          {salesChannels.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-gray-700 hover:bg-gray-50"
              title={label}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && label}
            </button>
          ))}
          <button
            onClick={onSignOut}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-red-600 hover:bg-red-50"
            title="Sign Out"
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
            {!collapsed && "Sign Out"}
          </button>
        </nav>
      </aside>
      {/* Mobile sidebar toggle button */}
      <button
        className="fixed bottom-6 left-6 z-50 md:hidden p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </>
  );
}
