import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Beams from "../Backgrounds/Beams/Beams";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Hero Section */}
      <section className="w-full py-20 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 relative overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/images/blueorb.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/60 z-0" />
        {/* Left: Headline and CTA */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-purple-500 to-black text-transparent bg-clip-text">
            AI-Powered SMS
            <br />
            Assistant Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Make every text message smarter and more personal. SwanAI helps you
            connect, automate, and analyze your SMS conversations with advanced
            AI, privacy, and seamless integration.
          </p>
          <Link
            to="/login?mode=signup"
            className="inline-flex items-center px-7 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 mb-10"
          >
            Get Started
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          {/* Supporting text block */}
          <div className="mb-8">
            <p className="text-base text-gray-700 mb-6">
              Trusted by teams and individuals to automate, personalize, and
              secure SMS communication. Boost productivity, save time, and keep
              your data private with SwanAI.
            </p>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex items-center space-x-8 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">
                  Product of the day
                </span>
                <span className="text-lg font-bold text-gray-900">3rd</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8" fill="#fff" />
                    <text
                      x="8"
                      y="12"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333"
                    >
                      P
                    </text>
                  </svg>
                </span>
                <span className="text-sm text-gray-700 font-medium">
                  Product Hunt
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Floating Cards */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-2xl min-h-[520px] mt-12 md:mt-0 md:ml-12 z-10">
          {/* Compliance Card */}
          <div className="absolute top-0 right-0 w-64 bg-white rounded-2xl shadow-lg p-5 z-20 border border-gray-100 md:-translate-y-2">
            <div className="flex items-center mb-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs font-semibold text-green-700">
                Compliant
              </span>
              <span className="ml-auto text-xs text-gray-400">3/3</span>
            </div>
            <div className="text-sm text-gray-800 font-semibold mb-2">
              SMS Compliance
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>Opt-in Confirmed</li>
              <li>Privacy Policy Sent</li>
              <li>Unsubscribe Option</li>
            </ul>
          </div>
          {/* AI Message Card */}
          <div className="absolute left-0 bottom-0 w-72 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-5 z-10 border border-white/30 md:translate-y-2 sm:left-2 sm:bottom-2">
            <div className="flex items-center mb-2">
              <span className="inline-block w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>
              <span className="text-xs font-semibold text-indigo-700">
                AI Message
              </span>
            </div>
            <div className="text-sm text-gray-800 font-semibold mb-2">
              "How can I help you today?"
            </div>
            <div className="flex space-x-2 mt-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                Personalized
              </span>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                Secure
              </span>
            </div>
          </div>
          {/* Productivity Card (with punkgirl image and floating messages) */}
          <div className="absolute left-24 top-8 w-80 h-96 relative z-0 overflow-visible md:translate-x-2 sm:left-8 sm:top-8">
            <img
              src="/images/punkgirl.png"
              alt="Punk Girl"
              className="w-full h-full object-cover rounded-[2.5rem] shadow-xl"
            />
            {/* Floating Chat Bubbles */}
            <div className="absolute inset-0">
              {/* Left message (floating, frosted glass) */}
              <div className="absolute -left-32 top-8 flex items-end z-20">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl px-4 py-3 text-gray-900 text-sm shadow-xl max-w-[16rem] border border-white/30">
                  Hi Mr.Smith, how would you rate our services? We'd love to
                  hear your feedback!
                  <span className="block text-xs text-gray-400 text-right mt-1">
                    11:20 AM
                  </span>
                </div>
              </div>
              {/* Right message (floating, frosted glass) */}
              <div className="absolute -right-32 top-28 flex items-end justify-end z-20">
                <div className="bg-indigo-400/60 backdrop-blur-md rounded-2xl px-4 py-3 text-white text-sm shadow-xl max-w-[16rem] relative border border-white/20">
                  Your services were excellent! Highly professional and exceeded
                  my expectations. I'll definitely recommend you to others!
                  <span className="block text-xs text-indigo-100 text-right mt-1">
                    11:22 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats & Value Proposition Section (no background, black text) */}
      <section className="w-full py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-black text-center mb-10">
            SwanAI is trusted by teams to increase productivity and efficiency
            in SMS communication.
          </h2>
          {/* Stats Row */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-16">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-black">
                98%
              </span>
              <span className="text-base text-black mt-2 text-center">
                Customer satisfaction rate
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-black">
                10,000+
              </span>
              <span className="text-base text-black mt-2 text-center">
                Businesses use SwanAI
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-black">
                50M+
              </span>
              <span className="text-base text-black mt-2 text-center">
                SMS sent monthly
              </span>
            </div>
          </div>
          {/* Subheadline and Cards */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-extrabold text-black mb-2 text-left">
              Accelerate your SMS strategy
            </h3>
            <p className="text-lg text-black mb-8 text-left max-w-2xl">
              SwanAI is built for teams and businesses that want more from their
              SMS communication—smarter automation, deeper insights, and
              enterprise-grade privacy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <h4 className="text-lg font-bold text-black mb-2 text-left">
                  The clear business choice
                </h4>
                <p className="text-black text-base text-left">
                  During evaluation, 9 out of 10 teams choose SwanAI for its
                  reliability, ease of use, and powerful AI features.
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <h4 className="text-lg font-bold text-black mb-2 text-left">
                  Ready for enterprise scale
                </h4>
                <p className="text-black text-base text-left">
                  Built to handle millions of messages and support organizations
                  of any size, with robust analytics and integrations.
                </p>
              </div>
              {/* Card 3 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-start shadow-sm">
                <h4 className="text-lg font-bold text-black mb-2 text-left">
                  Committed to privacy
                </h4>
                <p className="text-black text-base text-left">
                  SOC2 certified, privacy-first design, and zero data retention
                  options to keep your communications secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Example Use Section */}
      <section className="w-full py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left: Text */}
            <div className="flex flex-col items-start justify-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                See SwanAI in Action
              </h2>
              <p className="text-lg text-black mb-6 max-w-lg">
                <span className="font-semibold text-black">Example:</span>{" "}
                Sarah, a small business owner, uses SwanAI to automatically
                respond to customer SMS inquiries, send appointment reminders,
                and track engagement—all from her phone.
              </p>
              <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white shadow-xl">
                <div className="mb-2 font-bold">
                  "Hi Sarah, your appointment is confirmed for tomorrow at 2pm.
                  Reply YES to confirm or NO to reschedule."
                </div>
                <div className="text-gray-400 text-sm">
                  — Automated SMS from SwanAI
                </div>
              </div>
            </div>
            {/* Center: Image */}
            <div className="flex items-center justify-center">
              <img
                src="/images/hand.png"
                alt="SwanAI Example Use"
                className="w-full max-w-xs rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
            {/* Right: Text (right-aligned) */}
            <div className="flex flex-col items-end justify-center text-right">
              <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
                Real Results for Real Teams
              </h2>
              <p className="text-lg text-black mb-6 max-w-lg">
                Teams use SwanAI to automate follow-ups, gather feedback, and
                keep customers engaged—saving hours every week and boosting
                satisfaction.
              </p>
              <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white shadow-xl text-right">
                <div className="mb-2 font-bold">
                  "Hi Alex, thanks for your feedback! As a valued customer, you
                  get 10% off your next order. Reply YES to claim."
                </div>
                <div className="text-gray-400 text-sm">
                  — Automated SMS from SwanAI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Beams Background Section */}
      <div className="w-full h-[400px] flex items-center justify-center">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      {/* Features Section (Cursor-style, high contrast, left-aligned) */}
      <section className="w-full bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-extrabold text-white mb-4 text-left">
            Build SMS workflows faster
          </h2>
          <p className="text-lg text-gray-300 mb-12 text-left max-w-2xl">
            Intelligent, fast, and familiar—SwanAI is the best way to automate,
            personalize, and analyze your SMS communication with AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: AI SMS Engine */}
            <div className="bg-gradient-to-br from-[#18181b] to-[#232329] border border-white/10 rounded-2xl p-8 flex flex-col items-start shadow-xl">
              <div className="mb-6">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <polygon points="28,6 52,50 4,50" fill="url(#aiengine2)" />
                  <defs>
                    <linearGradient
                      id="aiengine2"
                      x1="4"
                      y1="6"
                      x2="52"
                      y2="50"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#a78bfa" />
                      <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-left">
                AI SMS Engine
              </h3>
              <p className="text-gray-200 text-base text-left">
                Automate replies, generate personalized messages, and analyze
                conversations with advanced AI models built for SMS.
              </p>
            </div>
            {/* Card 2: Seamless Experience */}
            <div className="bg-gradient-to-br from-[#18181b] to-[#232329] border border-white/10 rounded-2xl p-8 flex flex-col items-start shadow-xl">
              <div className="mb-6">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <rect
                    x="10"
                    y="10"
                    width="36"
                    height="36"
                    rx="8"
                    fill="url(#seamless2)"
                  />
                  <defs>
                    <linearGradient
                      id="seamless2"
                      x1="10"
                      y1="10"
                      x2="46"
                      y2="46"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#818cf8" />
                      <stop offset="1" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-left">
                Seamless Experience
              </h3>
              <p className="text-gray-200 text-base text-left">
                Import contacts, integrate with your favorite tools, and manage
                SMS campaigns effortlessly—all in one place.
              </p>
            </div>
            {/* Card 3: Privacy First */}
            <div className="bg-gradient-to-br from-[#18181b] to-[#232329] border border-white/10 rounded-2xl p-8 flex flex-col items-start shadow-xl">
              <div className="mb-6">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="18" fill="url(#privacy2)" />
                  <defs>
                    <radialGradient
                      id="privacy2"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="translate(28 28) scale(18)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#fff" />
                      <stop offset="1" stopColor="#a78bfa" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-left">
                Privacy First
              </h3>
              <p className="text-gray-200 text-base text-left">
                Your data stays yours. SwanAI is built with privacy in mind—no
                remote storage, full compliance, and user control.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">
            We help you connect in the simplest way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Personalized AI</h3>
              <p className="text-gray-500 text-sm">
                Your assistant adapts to your style and preferences for every
                conversation.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">SMS Integration</h3>
              <p className="text-gray-500 text-sm">
                Chat naturally with your AI assistant through SMS, anytime and
                anywhere.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-500 text-sm">
                Track your usage and get insights into your conversations with
                detailed analytics.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-500 text-sm">
                Your data is encrypted and never shared. Privacy and security
                are our top priorities.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Mission Statement */}
      <section className="py-16 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Our goal is to make AI accessible and helpful for everyone
          </h2>
          <p className="text-lg text-gray-500 mb-4">
            We believe technology should serve humanity. Our platform harnesses
            the power of AI to streamline communication and optimize outcomes.
          </p>
          <Link
            to="/about"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90"
          >
            About Us
          </Link>
        </div>
      </section>

      {/* FAQ Section (modern card style, black background) */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-12 text-left">
            Frequently asked questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                How does SwanAI secure my messages?
              </h3>
              <p className="text-gray-300">
                All messages are encrypted in transit and at rest. Privacy Mode
                ensures your data is never stored remotely. SwanAI is SOC2
                certified.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                Can I integrate SwanAI with my CRM?
              </h3>
              <p className="text-gray-300">
                Yes, SwanAI offers seamless integrations with popular CRMs and
                productivity tools to automate your SMS workflows.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Is there a free trial?</h3>
              <p className="text-gray-300">
                You can try SwanAI for free with no credit card required.
                Upgrade anytime for more features and higher usage limits.
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                How do I manage my team?
              </h3>
              <p className="text-gray-300">
                Admins can invite team members, assign roles, and monitor usage
                from the dashboard.
              </p>
            </div>
            {/* Card 5 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                What analytics are available?
              </h3>
              <p className="text-gray-300">
                Track message volume, response rates, and engagement metrics in
                real time with SwanAI Analytics.
              </p>
            </div>
            {/* Card 6 */}
            <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">How can I get support?</h3>
              <p className="text-gray-300">
                Contact our support team anytime at{" "}
                <a
                  href="mailto:support@swanai.com"
                  className="underline text-indigo-400"
                >
                  support@swanai.com
                </a>{" "}
                or visit our Help Center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (modern style, black background) */}
      <footer className="bg-black text-white pt-16 pb-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-12">
          {/* Brand and subscribe */}
          <div className="flex-1 mb-8 md:mb-0 flex flex-col justify-between">
            <div className="flex items-center mb-6">
              <img
                src="/images/swanlogo.png"
                alt="SwanAI Logo"
                className="w-8 h-8 mr-3"
              />
              <span className="text-2xl font-extrabold tracking-tight">
                SwanAI
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">
              In the new era of AI-powered communication, we help you connect
              smarter, faster, and more securely.
            </p>
            <form className="flex w-full max-w-xs">
              <input
                type="email"
                placeholder="name@email.com"
                className="flex-1 px-4 py-2 rounded-l bg-gray-900 text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-semibold rounded-r hover:bg-gray-200 transition"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
          {/* Social and links */}
          <div className="flex-[2] grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Socials */}
            <div>
              <div className="mb-4 font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
                <span className="ml-2">→</span>
              </div>
              <div className="mb-4 font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775A4.932 4.932 0 0 0 23.337 3.1a9.864 9.864 0 0 1-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z" />
                </svg>
                Twitter
                <span className="ml-2">→</span>
              </div>
              <div className="mb-4 font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406 2.697 2.387 2.403 3.499 2.344 4.78.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0z" />
                  <circle cx="12" cy="12" r="3.5" />
                </svg>
                Instagram
                <span className="ml-2">→</span>
              </div>
              <div className="mb-4 font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0" />
                </svg>
                Facebook
                <span className="ml-2">→</span>
              </div>
            </div>
            {/* Product */}
            <div>
              <div className="mb-4 font-semibold text-gray-400">PRODUCT</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Technology
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Releases
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <div className="mb-4 font-semibold text-gray-400">RESOURCES</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    System Guide
                  </a>
                </li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <div className="mb-4 font-semibold text-gray-400">COMPANY</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Culture
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Press Kit
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
