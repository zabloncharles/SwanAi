import React, { useState } from "react";
import { Link } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Support() {
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const faqs: FAQItem[] = [
    {
      question: "How do I get started with SwanAI?",
      answer:
        "Getting started is easy! Simply create an account, set up your AI personality preferences, and start chatting. You can customize your experience through the dashboard settings.",
    },
    {
      question: "What makes SwanAI different from other AI platforms?",
      answer:
        "SwanAI offers a unique combination of advanced natural language processing, privacy-focused features, and customizable AI personalities. Our platform prioritizes user privacy while delivering engaging and natural conversations.",
    },
    {
      question: "Is my data secure with SwanAI?",
      answer:
        "Yes, we take data security very seriously. All communications are end-to-end encrypted, and we implement strict data handling policies. You can also enable Privacy Mode for additional security.",
    },
    {
      question: "Can I integrate SwanAI with other tools?",
      answer:
        "Yes! SwanAI offers various integration options with popular tools like Google Calendar, Outlook, Notion, and Slack. You can also build custom integrations using our API.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We offer comprehensive support through our documentation, email support, and community forums. Our team is available to help with technical issues, account management, and general inquiries.",
    },
  ];

  const handleFAQClick = (index: number) => {
    setActiveFAQ(activeFAQ === index.toString() ? null : index.toString());
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Support Center
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              We're here to help you get the most out of SwanAI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-indigo-600 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@swanai.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-indigo-600 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900">Live Chat</h3>
                    <p className="text-gray-600">Available 24/7</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Get instant help from our support team
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-indigo-600 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-900">Documentation</h3>
                    <Link
                      to="/docs"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      View Documentation →
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Detailed guides and API references
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                  >
                    <button
                      className="w-full text-left focus:outline-none"
                      onClick={() => handleFAQClick(index)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            activeFAQ === index.toString() ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {activeFAQ === index.toString() && (
                        <p className="mt-2 text-gray-600">{faq.answer}</p>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Us
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <select
                  name="subject"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3"
                >
                  <option value="">Select a subject</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
              {submitStatus === "success" && (
                <p className="text-sm text-green-600">
                  Thank you for your message. We'll get back to you soon!
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-sm text-red-600">
                  There was an error sending your message. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <SlimFooter />
    </div>
  );
}
