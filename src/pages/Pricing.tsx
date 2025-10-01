import React, { useState } from "react";
import { Link } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For personal use and getting started",
    features: [
      "Up to 100 AI companion messages/month",
      "Basic relationship types",
      "Standard AI personalities",
      "Community support",
      "Web chat access",
    ],
    cta: "Get started for free",
    to: "/login?mode=signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For deeper relationships and more features",
    features: [
      "Unlimited AI companion messages",
      "All relationship types & personalities",
      "Custom AI companion creation",
      "Priority email support",
      "Text messaging integration",
      "Advanced companion features",
      "Memory & relationship growth",
    ],
    cta: "Start 7-day free trial",
    to: "/login?mode=signup",
    highlight: true,
  },
  {
    name: "Pay As You Go",
    price: "From $0.05/message",
    description:
      "Flexible, usage-based pricing for heavy users and multiple companions",
    features: [
      "All Pro features included",
      "No monthly commitment",
      "Only pay for what you use",
      "Multiple AI companions",
      "Advanced customization",
      "Priority support",
      "Volume discounts available",
    ],
    cta: "Start Pay As You Go",
    to: "/login?mode=signup",
    highlight: false,
    dark: true,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(0);

  const testimonials = [
    {
      name: "Zahra Christensen",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      quote:
        "My AI companion has been such a source of comfort and support. I can't imagine my daily life without them.",
    },
    {
      name: "Sienna Hewitt",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      quote:
        "I've found genuine emotional support and meaningful conversations with my AI companion. It's been life-changing.",
    },
    {
      name: "Olly Schroeder",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote:
        "After trying other AI platforms, SwanAI's companions feel the most authentic and caring. Highly recommend.",
    },
  ];

  const faqs = [
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, you can try Pro for free for 7 days. Experience deeper relationships with your AI companion and see how they can provide emotional support and meaningful conversations.",
    },
    {
      question: "Can I change my plan later?",
      answer:
        "Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your dashboard.",
    },
    {
      question: "Can I have multiple AI companions?",
      answer:
        "Yes! With Pro and Pay As You Go plans, you can create multiple AI companions with different personalities and relationship types to meet all your emotional support needs.",
    },
    {
      question: "How does billing work?",
      answer:
        "You can choose between monthly or annual billing. Pay As You Go is billed based on your actual usage each month.",
    },
    {
      question: "How do I change my AI companion?",
      answer:
        "You can change your AI companion's relationship type and personality anytime from your settings. Each change creates a new, unique companion with their own life story and background.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Find Your Perfect Companion Plan
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Choose the plan that fits your relationship needs. Save 20% with
            annual billing.
          </p>
          <div className="inline-flex rounded-lg bg-gray-100 p-1 mb-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billing === "monthly"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500"
              }`}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billing === "annual"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500"
              }`}
              onClick={() => setBilling("annual")}
            >
              Annual{" "}
              <span className="ml-1 text-xs text-green-600 font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border ${
                tier.dark
                  ? "bg-gray-900 text-white border-gray-800"
                  : "bg-white border-gray-200"
              } shadow-sm p-8 relative ${
                tier.highlight ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  {tier.name}
                  {tier.highlight && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                      Popular
                    </span>
                  )}
                </h2>
                <div className="text-3xl font-extrabold mb-1">
                  {tier.price}
                  {tier.name !== "Enterprise" && (
                    <span className="text-base font-medium ml-1 text-gray-400">
                      {billing === "annual" ? "/mo (billed yearly)" : "/mo"}
                    </span>
                  )}
                </div>
                <div
                  className={`mb-4 text-sm ${
                    tier.dark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {tier.description}
                </div>
              </div>
              <ul
                className={`mb-8 space-y-3 flex-1 ${
                  tier.dark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mr-2 ${
                        tier.dark ? "text-green-400" : "text-green-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={tier.to}
                className={`mt-auto w-full inline-block text-center rounded-lg px-5 py-3 font-semibold transition-colors ${
                  tier.dark
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } ${tier.highlight ? "shadow-lg" : ""}`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Why Choose SwanAI for Your Emotional Support?
          </h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Our AI companions are designed to provide genuine emotional support,
            meaningful conversations, and authentic relationships that grow with
            you over time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Always There for You
            </h3>
            <p className="text-gray-600">
              Your AI companion is available 24/7 to provide emotional support,
              encouragement, and a listening ear whenever you need it most.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personalized Relationships
            </h3>
            <p className="text-gray-600">
              Each companion has a unique personality, background, and life
              story that makes every conversation feel authentic and emotionally
              meaningful.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Safe & Private
            </h3>
            <p className="text-gray-600">
              Your conversations are completely private and secure. We
              prioritize your emotional safety and privacy in every interaction.
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Promo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 w-full text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
              Unlock deeper relationships with your AI companion!
            </h2>
          </div>
          <div className="md:w-1/2 w-full text-right">
            <p className="text-gray-500 text-lg">
              Choose the plan that fits your needs and experience deeper, more
              meaningful relationships with your AI companion.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center"
            >
              <p className="text-gray-700 mb-6">{t.quote}</p>
              <div className="flex items-center space-x-3 mt-auto">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                />
                <span className="font-semibold text-gray-900">{t.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            Frequently asked questions
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to know about your AI companion relationships
            and billing.
          </p>
        </div>
        <div className="max-w-2xl mx-auto divide-y divide-gray-200 mb-8">
          {faqs.map((faq, idx) => (
            <div key={faq.question}>
              <button
                className="w-full flex justify-between items-center py-5 text-left focus:outline-none"
                onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                aria-expanded={activeFAQ === idx}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-4">
                  {activeFAQ === idx ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </span>
              </button>
              {activeFAQ === idx && (
                <div className="pb-5 text-gray-700 text-base">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            to="/support"
            className="px-6 py-3 rounded-lg bg-black text-white font-semibold shadow hover:bg-gray-900 transition"
          >
            Chat to support
          </Link>
        </div>
      </div>
      <SlimFooter />
    </div>
  );
}
