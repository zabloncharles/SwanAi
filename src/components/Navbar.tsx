import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    {
      name: "Features",
      href: "#features",
      dropdown: [
        { name: "AI Chat", href: "#ai-chat" },
        { name: "Analytics", href: "#analytics" },
        { name: "Integrations", href: "#integrations" },
      ],
    },
    {
      name: "Pricing",
      href: "#pricing",
      dropdown: [
        { name: "Free Plan", href: "#free" },
        { name: "Pro Plan", href: "#pro" },
        { name: "Enterprise", href: "#enterprise" },
      ],
    },
    { name: "About", href: "#about" },
  ];

  const authLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Analytics", path: "/analytics" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full top-0 left-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/images/swanlogo.png"
            alt="SwanAI Logo"
            className="w-8 h-8"
          />
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            SwanAI
          </span>
        </Link>

        {/* Desktop Nav */}
        {user ? (
          <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/docs"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Docs
            </Link>
            <button className="hover:text-indigo-600">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A9 9 0 1 1 18.88 17.804M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition flex items-center"
                  onMouseEnter={() => setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDownIcon className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" />
                  )}
                </a>
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-2">
                    {link.dropdown.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/login"
              className="ml-4 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Hamburger Button (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-indigo-600"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white/95">
          {user ? (
            <>
              {authLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg font-medium text-sm ${
                    isActive(item.path)
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/dashboard"
                className="block mt-2 px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm hover:bg-indigo-700 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  signOut(auth);
                  setIsMobileMenuOpen(false);
                }}
                className="block mt-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {navLinks.map((link) => (
                <div key={link.name}>
                  <a
                    href={link.href}
                    className="block px-4 py-2 rounded-lg font-medium text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                  {link.dropdown && (
                    <div className="pl-4 mt-1 space-y-1">
                      {link.dropdown.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                to="/login"
                className="block mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
