import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const tiers = [
  {
    name: "Free",
    price: { monthly: "$0", annual: "$0" },
    features: [
      "Basic AI personality customization",
      "Standard response times",
      "Limited message history",
      "Basic support",
    ],
    cta: "Free",
    mostPopular: false,
  },
  {
    name: "Pro",
    price: { monthly: "$9.99", annual: "$99.99" },
    features: [
      "Advanced AI personality customization",
      "AI relationship customization",
      "Priority response times",
      "Extended message history",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Upgrade to Pro",
    mostPopular: true,
  },
  {
    name: "Pay As You Go",
    price: { monthly: "Custom", annual: "Custom" },
    features: [
      "All Pro features",
      "Custom usage-based pricing",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
    ],
    cta: "Pay As You Go",
    mostPopular: false,
  },
];

const PLAN_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  ULTIMATE: 'ultimate',
};

const PLAN_DISPLAY_NAMES = {
  [PLAN_TYPES.FREE]: 'Free',
  [PLAN_TYPES.PRO]: 'Pro',
  [PLAN_TYPES.ULTIMATE]: 'Pay As You Go',
};

// Feature comparison data
const featureTable = [
  { feature: 'AI Personality Customization', free: true, pro: true, custom: true },
  { feature: 'AI Relationship Customization', free: false, pro: true, custom: true },
  { feature: 'Priority Response Times', free: false, pro: true, custom: true },
  { feature: 'Extended Message History', free: false, pro: true, custom: true },
  { feature: 'Priority Support', free: false, pro: true, custom: true },
  { feature: 'Advanced Analytics', free: false, pro: true, custom: true },
  { feature: 'Custom Usage-Based Pricing', free: false, pro: false, custom: true },
  { feature: 'Dedicated Support', free: false, pro: false, custom: true },
  { feature: 'Custom Integrations', free: false, pro: false, custom: true },
  { feature: 'SLA Guarantees', free: false, pro: false, custom: true },
];

export default function PricingSection() {
  const [user] = useAuthState(auth);
  const [planType, setPlanType] = useState<string | null>(null); // null = not loaded, string = loaded
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setPlanType(null);
      return;
    }
    setLoading(true);
    setError('');
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setPlanType(data.type || PLAN_TYPES.FREE);
          setBilling(data.billingPeriod || 'annual');
        } else {
          setPlanType(PLAN_TYPES.FREE);
        }
      })
      .catch(() => setError('Failed to load plan.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpgrade = (plan: string) => {
    setPendingPlan(plan);
    setShowConfirm(true);
  };

  const confirmUpgrade = async () => {
    if (!pendingPlan || !user) return;
    setShowConfirm(false);
    setModalLoading(true);
    setModalSuccess(false);
    setShowModal(true);

    try {
      // Map the plan name to the type value
      let planTypeValue = PLAN_TYPES.FREE;
      switch (pendingPlan) {
        case 'Free':
          planTypeValue = PLAN_TYPES.FREE;
          break;
        case 'Pro':
          planTypeValue = PLAN_TYPES.PRO;
          break;
        case 'Pay As You Go':
          planTypeValue = PLAN_TYPES.ULTIMATE;
          break;
        default:
          planTypeValue = PLAN_TYPES.FREE;
      }

      // Update the user's plan and billing period in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        type: planTypeValue,
        planUpdatedAt: new Date(),
        billingPeriod: billing,
      });

      // Wait for 5 seconds before showing success
      await new Promise(resolve => setTimeout(resolve, 5000));

      setModalLoading(false);
      setModalSuccess(true);
      setPlanType(planTypeValue);
      setModalMessage(
        `Payment successful! You are now on the ${pendingPlan} plan with ${billing} billing.`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Auto-dismiss the success modal after 3 seconds
      setTimeout(() => {
        setShowModal(false);
        setModalSuccess(false);
      }, 3000);

      setPendingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      setModalLoading(false);
      setModalMessage('Failed to update plan. Please try again.');
    }
  };

  const cancelUpgrade = () => {
    setShowConfirm(false);
    setPendingPlan(null);
  };

  // UI rendering
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-gray-500">Loading plans...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center p-1 bg-gray-100 rounded-lg shadow-md">
          <button
            onClick={() => setBilling('monthly')}
            className={`relative px-6 py-2 text-base font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:text-blue-700'
            }`}
            aria-pressed={billing === 'monthly'}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`relative px-6 py-2 text-base font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              billing === 'annual'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:text-blue-700'
            }`}
            aria-pressed={billing === 'annual'}
          >
            Annual
            <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const isCurrent = planType && PLAN_DISPLAY_NAMES[planType] === tier.name;
          const isPro = tier.name === 'Pro';
          return (
            <div
              key={tier.name}
              className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-sm transition-transform duration-200 ${
                isPro ? 'ring-4 ring-blue-500 scale-105 shadow-lg z-10' : 'border border-gray-200'
              } ${isCurrent ? 'border-4 border-green-500' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-36 rounded-full bg-blue-600 px-3 py-1 text-center text-sm font-bold text-white shadow">
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold shadow">
                  Current Plan
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="mt-2 flex items-baseline text-gray-900">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {tier.price[billing]}
                  </span>
                  {tier.price[billing] !== 'Custom' && (
                    <span className="ml-1 text-xl font-semibold">
                      /{billing === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg
                          className="h-5 w-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                {isCurrent ? (
                  <button
                    className="w-full rounded-lg px-4 py-2 text-base font-semibold bg-gray-100 text-gray-900 cursor-not-allowed border border-gray-300 transition-transform duration-150"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier.name)}
                    className="w-full rounded-lg px-4 py-2 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all active:scale-95"
                  >
                    {tier.cta}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="overflow-x-auto mb-10 mt-10">
        <table className="min-w-full border border-gray-200 rounded-lg bg-white text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Feature</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Free</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Pro</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Custom</th>
            </tr>
          </thead>
          <tbody>
            {featureTable.map(row => (
              <tr key={row.feature} className="border-t">
                <td className="px-4 py-2 text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
                  {row.feature}
                </td>
                <td className="px-4 py-2 text-center">{row.free ? <span title="Included">✓</span> : <span title="Not included">—</span>}</td>
                <td className="px-4 py-2 text-center">{row.pro ? <span title="Included">✓</span> : <span title="Not included">—</span>}</td>
                <td className="px-4 py-2 text-center">{row.custom ? <span title="Included">✓</span> : <span title="Not included">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Testimonial/Guarantee */}
      <div className="mt-12 flex flex-col items-start">
        <div className="max-w-xl">
          <div className="text-lg font-semibold text-blue-700 mb-2">“SwanAI Pro has transformed my workflow. The support is top-notch and the features are worth every penny!”</div>
          <div className="text-sm text-gray-500">— Happy Customer</div>
        </div>
    
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Plan Change
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to change your plan to {pendingPlan}? This will
              update your billing immediately.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelUpgrade}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {modalLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Processing your request...</p>
              </div>
            ) : modalSuccess ? (
              <div className="text-center">
                <svg
                  className="h-12 w-12 text-green-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-gray-900">{modalMessage}</p>
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="h-12 w-12 text-red-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-sm text-gray-900">{modalMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {modalMessage}
        </div>
      )}
    </div>
  );
}
