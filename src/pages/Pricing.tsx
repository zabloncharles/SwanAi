import React, { useState } from "react";
import { Link } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For personal use and hobbyists",
    features: [
      "Up to 100 AI messages/month",
      "Basic analytics",
      "Standard AI personalities",
      "Community support",
      "1 workspace",
    ],
    cta: "Get started for free",
    to: "/login?mode=signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For power users and small teams",
    features: [
      "Unlimited AI messages",
      "Advanced analytics",
      "Custom AI personalities",
      "Priority email support",
      "Integrations (Google Calendar, Slack, Notion)",
      "Up to 5 workspaces",
      "Team collaboration (up to 10 members)",
    ],
    cta: "Start 7-day free trial",
    to: "/login?mode=signup",
    highlight: true,
  },
  {
    name: "Pay As You Go",
    price: "From $0.05/message",
    description:
      "Flexible, usage-based pricing for growing teams and businesses",
    features: [
      "All Pro features included",
      "No monthly commitment",
      "Only pay for what you use",
      "Unlimited workspaces & members",
      "API & custom integrations",
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
        "If you're managing or building any kind of community, it's pointless unless you're using SwanAI. Try it out.",
    },
    {
      name: "Sienna Hewitt",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      quote:
        "We've been using SwanAI to manage our entire community and can't imagine working without it. We recommend it to everyone.",
    },
    {
      name: "Olly Schroeder",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote:
        "We tried every AI platform out there and were relieved to finally find SwanAI.",
    },
  ];

  const faqs = [
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, you can try Pro for free for 7 days. If you want, we'll provide you with a free, personalized onboarding call to get you up and running as soon as possible.",
    },
    {
      question: "Can I change my plan later?",
      answer:
        "Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your dashboard.",
    },
    {
      question: "Can other info be added to an invoice?",
      answer:
        "Yes, you can add company details, VAT numbers, and more to your invoices from your account settings.",
    },
    {
      question: "How does billing work?",
      answer:
        "You can choose between monthly or annual billing. Pay As You Go is billed based on your actual usage each month.",
    },
    {
      question: "How do I change my account email?",
      answer:
        "You can change your email address in your profile settings. If you need help, contact support.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Plans and Pricing
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Choose the plan that fits your needs. Save 20% with annual billing.
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

      {/* Subscription Promo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 w-full text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-0">
              Unlock the full power of SwanAI with a subscription!
            </h2>
          </div>
          <div className="md:w-1/2 w-full text-right">
            <p className="text-gray-500 text-lg">
              Choose the plan that fits your workflow and experience advanced
              AI, analytics, and productivity features designed for you.
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
            Everything you need to know about the product and billing.
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
