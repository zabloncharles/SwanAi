import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", title: "Getting Started" },
    { id: "ai-chat", title: "AI Chat" },
    { id: "analytics", title: "Analytics" },
    { id: "integrations", title: "Integrations" },
    { id: "api", title: "API Reference" },
    { id: "security", title: "Security" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll<HTMLElement>("section[id]");

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId || "getting-started");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mt-8">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Documentation
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Everything you need to know about using SwanAI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === section.id
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-12">
              {/* Getting Started Section */}
              <section id="getting-started" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Getting Started
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Welcome to SwanAI! This guide will help you get started with
                    our platform and make the most of its features.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Quick Start Guide
                  </h3>
                  <ol className="list-decimal list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Create an Account</strong>
                      <p className="ml-6 mt-1">
                        Sign up for a free account to get started with SwanAI.
                      </p>
                    </li>
                    <li>
                      <strong>Set Up Your Profile</strong>
                      <p className="ml-6 mt-1">
                        Configure your AI personality and relationship
                        preferences in the dashboard.
                      </p>
                    </li>
                    <li>
                      <strong>Start Chatting</strong>
                      <p className="ml-6 mt-1">
                        Begin conversations with your AI companion and explore
                        different features.
                      </p>
                    </li>
                  </ol>
                </div>
              </section>

              {/* AI Chat Section */}
              <section id="ai-chat" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  AI Chat Features
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Our AI chat system is designed to provide natural, engaging
                    conversations while maintaining privacy and security.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Key Features
                  </h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Natural Language Processing</strong>
                      <p className="ml-6 mt-1">
                        Advanced NLP capabilities for human-like conversations
                      </p>
                    </li>
                    <li>
                      <strong>Context Awareness</strong>
                      <p className="ml-6 mt-1">
                        Maintains conversation context for coherent interactions
                      </p>
                    </li>
                    <li>
                      <strong>Privacy Mode</strong>
                      <p className="ml-6 mt-1">
                        Enhanced privacy features for sensitive conversations
                      </p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Analytics Section */}
              <section id="analytics" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Analytics Dashboard
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Track and analyze your AI interactions with our
                    comprehensive analytics dashboard.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Available Metrics
                  </h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Conversation Analytics</strong>
                      <p className="ml-6 mt-1">
                        Track conversation patterns and engagement metrics
                      </p>
                    </li>
                    <li>
                      <strong>Usage Statistics</strong>
                      <p className="ml-6 mt-1">
                        Monitor your AI usage and feature adoption
                      </p>
                    </li>
                    <li>
                      <strong>Performance Insights</strong>
                      <p className="ml-6 mt-1">
                        Analyze response times and interaction quality
                      </p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Integrations Section */}
              <section id="integrations" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Integrations
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Connect SwanAI with your favorite tools and platforms.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Available Integrations
                  </h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Calendar Apps</strong>
                      <p className="ml-6 mt-1">
                        Sync with Google Calendar and Outlook
                      </p>
                    </li>
                    <li>
                      <strong>Productivity Tools</strong>
                      <p className="ml-6 mt-1">
                        Integrate with Notion, Slack, and more
                      </p>
                    </li>
                    <li>
                      <strong>Custom Integrations</strong>
                      <p className="ml-6 mt-1">
                        Build your own integrations using our API
                      </p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* API Reference Section */}
              <section id="api" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  API Reference
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Integrate SwanAI into your applications using our RESTful
                    API.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    API Endpoints
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <code className="text-sm font-mono text-gray-800">
                        POST /api/v1/chat
                      </code>
                      <p className="mt-1 text-gray-600">
                        Send messages to the AI chat system
                      </p>
                    </div>
                    <div>
                      <code className="text-sm font-mono text-gray-800">
                        GET /api/v1/analytics
                      </code>
                      <p className="mt-1 text-gray-600">
                        Retrieve analytics data
                      </p>
                    </div>
                    <div>
                      <code className="text-sm font-mono text-gray-800">
                        POST /api/v1/integrations
                      </code>
                      <p className="mt-1 text-gray-600">
                        Configure platform integrations
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Security
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Learn about our security measures and best practices.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    Security Features
                  </h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>End-to-End Encryption</strong>
                      <p className="ml-6 mt-1">
                        All communications are encrypted using industry-standard
                        protocols
                      </p>
                    </li>
                    <li>
                      <strong>Data Protection</strong>
                      <p className="ml-6 mt-1">
                        Strict data handling and storage policies
                      </p>
                    </li>
                    <li>
                      <strong>Access Control</strong>
                      <p className="ml-6 mt-1">
                        Role-based access control and authentication
                      </p>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <SlimFooter />
    </div>
  );
}
