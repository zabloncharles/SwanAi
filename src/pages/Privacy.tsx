import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import SlimFooter from "../components/SlimFooter";

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("information");

  const sections = [
    { id: "information", title: "Information We Collect" },
    { id: "usage", title: "How We Use Your Information" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Rights" },
    { id: "retention", title: "Data Retention" },
    { id: "contact", title: "Contact Us" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Find the current section based on scroll position
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop - 100 &&
            scrollPosition < offsetTop + offsetHeight - 100
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Adjust this value based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/punkgirl.png"
            alt="Privacy background"
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
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl text-center mb-8">
            Your privacy is important to us. Learn how we protect your data and
            maintain your trust.
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

      {/* Main Content with Sidebar */}
      <div className="flex flex-col md:flex-row">
        {/* Left Menu */}
        <div className="w-full md:w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Privacy Policy Content */}
        <section className="flex-1 py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              <div id="information">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We collect information that you provide directly to us,
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, phone number)</li>
                    <li>Communication preferences</li>
                    <li>Message content and interaction data</li>
                    <li>Device and usage information</li>
                  </ul>
                </div>
              </div>

              <div id="usage" className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  2. How We Use Your Information
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and maintain our services</li>
                    <li>Process and complete transactions</li>
                    <li>Send you technical notices and support messages</li>
                    <li>
                      Communicate with you about products, services, and events
                    </li>
                    <li>Improve our services and develop new features</li>
                  </ul>
                </div>
              </div>

              <div id="security" className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  3. Data Security
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal data:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>End-to-end encryption for all messages</li>
                    <li>Secure data storage and transmission</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>
              </div>

              <div id="rights" className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  4. Your Rights
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to data processing</li>
                    <li>Data portability</li>
                  </ul>
                </div>
              </div>

              <div id="retention" className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  5. Data Retention
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    We retain your personal data only for as long as necessary
                    to provide our services and fulfill the purposes outlined in
                    this privacy policy. You can choose to enable Privacy Mode,
                    which ensures your data is never stored remotely.
                  </p>
                </div>
              </div>

              <div id="contact" className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  6. Contact Us
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Email:</p>
                    <a
                      href="mailto:privacy@swanai.com"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      privacy@swanai.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SlimFooter />
    </div>
  );
}
