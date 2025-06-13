import React, { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with your personal SMS AI assistant.",
    features: [
      "20 SMS AI messages/month",
      "Choose your AI's personality (friend, family, assistant)",
      "Basic reminders",
      "Customer support",
    ],
    cta: "Get started for free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "Unlock unlimited SMS, advanced reminders, and integrations.",
    features: [
      "Unlimited SMS AI conversations",
      "Choose your AI's personality (friend, family, assistant)",
      "Custom AI relationships: friend, cousin, parent, assistant, more",
      "Advanced reminders & scheduling",
      "Email & calendar integration (Gmail, Outlook)",
      "Priority email support",
      "Integrations (Google Calendar)",
    ],
    cta: "Start 7-day free trial",
    highlight: true,
  },
  {
    name: "Pay As You Go",
    price: "From $0.05/msg",
    description:
      "Flexible, usage-based pricing for growing teams and businesses.",
    features: [
      "All Pro features included",
      "No monthly commitment",
      "Only pay for what you use",
      "Priority support",
      "Volume discounts available",
    ],
    cta: "Start Pay As You Go",
    highlight: false,
    dark: true,
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const handleUpgrade = (plan: string) => {
    setPendingPlan(plan);
    setShowConfirm(true);
  };

  const confirmUpgrade = () => {
    if (!pendingPlan) return;
    setShowConfirm(false);
    setModalLoading(true);
    setModalSuccess(false);
    setShowModal(true);
    setTimeout(() => {
      setModalLoading(false);
      setModalSuccess(true);
      setCurrentPlan(pendingPlan);
      setModalMessage(
        `Payment successful! You are now on the ${pendingPlan} plan.`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setPendingPlan(null);
    }, 5000);
  };

  const cancelUpgrade = () => {
    setShowConfirm(false);
    setPendingPlan(null);
  };

  const currentPlanObj = tiers.find((t) => t.name === currentPlan);
  const pendingPlanObj = tiers.find((t) => t.name === pendingPlan);

  return (
    <div>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {modalMessage}
        </div>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-700">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {modalLoading ? (
              <>
                <div className="w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                  <svg
                    className="animate-spin h-16 w-16 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Processing payment...
                </h2>
                <p className="text-gray-500 text-center mb-6">
                  Please wait while we process your payment.
                </p>
              </>
            ) : modalSuccess ? (
              <>
                <div className="flex flex-col items-center justify-center h-64">
                  <svg
                    className="w-16 h-16 text-green-500 mb-4"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Payment Successful
                  </h2>
                  <p className="text-gray-500 text-center mb-6">
                    {modalMessage}
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-700">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative flex flex-col items-center">
            <button
              onClick={cancelUpgrade}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Confirm Plan Change
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to switch to the{" "}
              <span className="font-semibold text-indigo-600">
                {pendingPlan}
              </span>{" "}
              plan?
            </p>
            {/* Plan Comparison */}
            {currentPlanObj && pendingPlanObj && (
              <div className="w-full mb-6">
                <div className="flex justify-between gap-4 text-xs font-medium mb-1">
                  <span className="flex-1 text-center text-gray-400 uppercase tracking-wide">
                    Current
                  </span>
                  <span className="flex-1 text-center text-gray-400 uppercase tracking-wide">
                    New
                  </span>
                </div>
                <div className="flex justify-between gap-4 mb-2">
                  <span className="flex-1 text-center text-gray-700 font-semibold">
                    {currentPlanObj.name}
                  </span>
                  <span className="flex-1 text-center text-indigo-600 font-semibold">
                    {pendingPlanObj.name}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    {currentPlanObj.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                        <span className="text-gray-800 text-sm leading-snug">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    {pendingPlanObj.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
                        <span
                          className={`text-sm leading-snug ${
                            currentPlanObj.features.includes(f)
                              ? "text-gray-800"
                              : "font-semibold text-indigo-600"
                          }`}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-2">
              <button
                onClick={confirmUpgrade}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Yes, Confirm
              </button>
              <button
                onClick={cancelUpgrade}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mb-8">
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
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col rounded-2xl border ${
              tier.dark
                ? "bg-gray-900 text-white border-gray-800"
                : "bg-white border-gray-200"
            } shadow-sm p-8 relative ${
              tier.highlight ? "ring-2 ring-indigo-500" : ""
            } ${currentPlan === tier.name ? "ring-4 ring-green-400" : ""}`}
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-1 flex items-center">
                {tier.name}
                {tier.highlight && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    Popular
                  </span>
                )}
                {currentPlan === tier.name && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-500 inline-block"
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
                    Current Plan
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
            <button
              className={`mt-auto w-full inline-block text-center rounded-lg px-5 py-3 font-semibold transition-colors focus:outline-none ${
                currentPlan === tier.name
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : tier.dark
                  ? "bg-white text-gray-900 hover:bg-gray-100"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              } ${tier.highlight ? "shadow-lg" : ""}`}
              onClick={() => handleUpgrade(tier.name)}
              disabled={currentPlan === tier.name}
            >
              {currentPlan === tier.name ? "Current Plan" : tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
