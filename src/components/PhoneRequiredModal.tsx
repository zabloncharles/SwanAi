import React, { useState, useEffect } from "react";

interface PhoneRequiredModalProps {
  open: boolean;
  onSave: (phone: string, firstName: string, lastName: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  fadeIn?: boolean;
  startStep?: number;
  phone?: string;
  firstName?: string;
  lastName?: string;
  onClose?: () => void;
}

function formatUSPhoneNumber(value: string) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function isValidUSPhoneNumber(value: string) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  // US numbers are 10 digits and cannot start with 0 or 1
  return /^([2-9][0-9]{2}[2-9][0-9]{6})$/.test(digits);
}

export default function PhoneRequiredModal({
  open,
  onSave,
  loading,
  error,
  fadeIn = false,
  startStep = 1,
  phone: initialPhone = "",
  firstName: initialFirstName = "",
  lastName: initialLastName = "",
  onClose,
}: PhoneRequiredModalProps) {
  const [step, setStep] = useState(startStep);
  const [phone, setPhone] = useState(initialPhone);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneError, setPhoneError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setStep(startStep);
  }, [startStep]);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    setFirstName(initialFirstName);
  }, [initialFirstName]);

  useEffect(() => {
    setLastName(initialLastName);
  }, [initialLastName]);

  // Dismiss after 4 seconds if success
  useEffect(() => {
    if (success && onClose) {
      const timeout = setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [success, onClose]);

  if (!open) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatUSPhoneNumber(raw);
    setPhone(formatted);
    if (
      formatted.replace(/\D/g, "").length === 10 &&
      !isValidUSPhoneNumber(formatted)
    ) {
      setPhoneError("Please enter a valid US phone number.");
    } else {
      setPhoneError("");
    }
  };

  const canProceed =
    phone.replace(/\D/g, "").length === 10 && isValidUSPhoneNumber(phone);

  function formatName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  const handleSave = async () => {
    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    await onSave(phone, formattedFirstName, formattedLastName);
    setSuccess(true);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-700 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: fadeIn ? "auto" : "none" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {success ? (
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
            <h2 className="text-2xl font-bold mb-2 text-center text-green-700">
              Profile Updated!
            </h2>
            <p className="text-gray-500 text-center">
              Your information has been saved successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <img
                src="/images/swanlogo.png"
                alt="SwanAI Logo"
                className="w-12 h-12 mb-2"
              />
              <h2 className="text-2xl font-bold mb-1 text-center">
                Complete Your Profile
              </h2>
            </div>
            {step === 1 && (
              <>
                <p className="text-gray-500 mb-6 text-center text-sm">
                  To continue using{" "}
                  <span className="font-semibold text-indigo-600">SwanAI</span>,
                  please add your phone number. This helps us secure your
                  account and provide important notifications.
                </p>
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="(555) 123-4567"
                    disabled={loading}
                    maxLength={14}
                  />
                  {(phoneError || error) && (
                    <div className="text-red-500 text-xs mt-1">
                      {phoneError || error}
                    </div>
                  )}
                </div>
                <button
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-sm hover:shadow-md transition disabled:opacity-60"
                  onClick={() => setStep(2)}
                  disabled={loading || !canProceed}
                >
                  Next
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <p className="text-gray-500 mb-6 text-center text-sm">
                  Please enter your first and last name to complete your
                  profile.
                </p>
                <div className="mb-4">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Enter your first name"
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Enter your last name"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-xs mb-2">{error}</div>
                )}
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold text-lg shadow hover:bg-gray-200 transition"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-sm hover:shadow-md transition disabled:opacity-60"
                    onClick={handleSave}
                    disabled={loading || !firstName || !lastName}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
