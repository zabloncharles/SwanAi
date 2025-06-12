import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      {/* Hero Section */}
      <section className="w-full pt-36 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 mix-blend-multiply" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Your AI-Powered SMS Assistant
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Automate, personalize, and analyze your text conversations with
            advanced AI—securely and effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white rounded-lg font-semibold text-lg shadow-sm hover:bg-white/20 transition-all duration-200"
            >
              Learn More
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
