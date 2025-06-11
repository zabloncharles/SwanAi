import React from "react";
import { Link } from "react-router-dom";

export default function SlimFooter() {
  return (
    <footer className="bg-black text-white pt-12 pb-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-8">
        <div className="flex items-center mb-6 md:mb-0">
          <img
            src="/images/swanlogo.png"
            alt="SwanAI Logo"
            className="w-8 h-8 mr-3"
          />
          <span className="text-2xl font-extrabold tracking-tight">SwanAI</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/docs" className="hover:underline">
            Docs
          </Link>
          <a href="mailto:support@swanai.com" className="hover:underline">
            Support
          </a>
        </div>
        <div className="text-xs text-gray-400 text-center md:text-right">
          &copy; {new Date().getFullYear()} SwanAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
