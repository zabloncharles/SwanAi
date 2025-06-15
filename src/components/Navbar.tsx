import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import {
  Bars3Icon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "./UserContext";

export default function Navbar() {
  const [user] = useAuthState(auth);
  const { userData } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    {
      name: "Features",
      href: "/docs",
      icon: <StarIcon className="w-5 h-5 mr-2" />,
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: <TagIcon className="w-5 h-5 mr-2" />,
    },
    {
      name: "About",
      href: "/about",
      icon: <InformationCircleIcon className="w-5 h-5 mr-2" />,
    },
  ];

  const authLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Analytics", path: "/analytics" },
    { name: "About", path: "/about" },
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
            <Link
              to="/about"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              About
            </Link>
            {/* User Profile Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 transition focus:outline-none"
                onClick={() => setIsMobileMenuOpen(false)}
                type="button"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 1 1 18.88 17.804M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
                <span className="font-medium text-gray-700">{userData?.firstName || user?.displayName?.split(' ')[0] || user?.email?.split("@")[0]}</span>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity duration-150">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut(auth)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition"
              >
                {link.icon && link.icon}
                {link.name}
              </Link>
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
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && link.icon}
                  {link.name}
                </Link>
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
