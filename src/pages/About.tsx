import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import SlimFooter from "../components/SlimFooter";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/punkgirl.png"
            alt="About background"
            className="w-full h-full object-contain border-b border-[#b6bfcd3b] filter drop-shadow-[2px_4px_6px_black]"
          />
          <div className="absolute inset-0" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/images/swanlogo.png"
            alt="SwanAI Logo"
            className="w-14 h-14 mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center">
            About SwanAI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl text-center mb-8">
            Learn more about our mission to revolutionize SMS communication with AI.
          </p>
          <div className="flex justify-center">
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 