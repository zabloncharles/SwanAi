import React, { useState, useEffect } from "react";

interface PhoneRequiredModalProps {
  open: boolean;
  onSave: (
    phone: string,
    firstName: string,
    lastName: string,
    age: string,
    gender: string
  ) => Promise<void>;
  loading?: boolean;
  error?: string;
  fadeIn?: boolean;
  startStep?: number;
  phone?: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  onClose?: () => void;
}

// Country codes for phone numbers
const countryCodes = [
  { code: "+1", country: "US", name: "United States" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+39", country: "IT", name: "Italy" },
  { code: "+34", country: "ES", name: "Spain" },
  { code: "+31", country: "NL", name: "Netherlands" },
  { code: "+32", country: "BE", name: "Belgium" },
  { code: "+41", country: "CH", name: "Switzerland" },
  { code: "+43", country: "AT", name: "Austria" },
  { code: "+46", country: "SE", name: "Sweden" },
  { code: "+47", country: "NO", name: "Norway" },
  { code: "+45", country: "DK", name: "Denmark" },
  { code: "+358", country: "FI", name: "Finland" },
  { code: "+48", country: "PL", name: "Poland" },
  { code: "+420", country: "CZ", name: "Czech Republic" },
  { code: "+36", country: "HU", name: "Hungary" },
  { code: "+30", country: "GR", name: "Greece" },
  { code: "+351", country: "PT", name: "Portugal" },
  { code: "+353", country: "IE", name: "Ireland" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+64", country: "NZ", name: "New Zealand" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+82", country: "KR", name: "South Korea" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+52", country: "MX", name: "Mexico" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+54", country: "AR", name: "Argentina" },
  { code: "+56", country: "CL", name: "Chile" },
  { code: "+57", country: "CO", name: "Colombia" },
  { code: "+58", country: "VE", name: "Venezuela" },
  { code: "+51", country: "PE", name: "Peru" },
  { code: "+593", country: "EC", name: "Ecuador" },
  { code: "+595", country: "PY", name: "Paraguay" },
  { code: "+598", country: "UY", name: "Uruguay" },
  { code: "+591", country: "BO", name: "Bolivia" },
  { code: "+27", country: "ZA", name: "South Africa" },
  { code: "+234", country: "NG", name: "Nigeria" },
  { code: "+20", country: "EG", name: "Egypt" },
  { code: "+212", country: "MA", name: "Morocco" },
  { code: "+216", country: "TN", name: "Tunisia" },
  { code: "+213", country: "DZ", name: "Algeria" },
  { code: "+254", country: "KE", name: "Kenya" },
  { code: "+255", country: "TZ", name: "Tanzania" },
  { code: "+256", country: "UG", name: "Uganda" },
  { code: "+233", country: "GH", name: "Ghana" },
  { code: "+221", country: "SN", name: "Senegal" },
  { code: "+225", country: "CI", name: "Ivory Coast" },
  { code: "+237", country: "CM", name: "Cameroon" },
  { code: "+236", country: "CF", name: "Central African Republic" },
  { code: "+235", country: "TD", name: "Chad" },
  { code: "+241", country: "GA", name: "Gabon" },
  { code: "+242", country: "CG", name: "Republic of the Congo" },
  { code: "+243", country: "CD", name: "Democratic Republic of the Congo" },
  { code: "+244", country: "AO", name: "Angola" },
  { code: "+245", country: "GW", name: "Guinea-Bissau" },
  { code: "+246", country: "IO", name: "British Indian Ocean Territory" },
  { code: "+247", country: "AC", name: "Ascension Island" },
  { code: "+248", country: "SC", name: "Seychelles" },
  { code: "+249", country: "SD", name: "Sudan" },
  { code: "+250", country: "RW", name: "Rwanda" },
  { code: "+251", country: "ET", name: "Ethiopia" },
  { code: "+252", country: "SO", name: "Somalia" },
  { code: "+253", country: "DJ", name: "Djibouti" },
  { code: "+257", country: "BI", name: "Burundi" },
  { code: "+258", country: "MZ", name: "Mozambique" },
  { code: "+259", country: "ZW", name: "Zimbabwe" },
  { code: "+260", country: "ZM", name: "Zambia" },
  { code: "+261", country: "MG", name: "Madagascar" },
  { code: "+262", country: "RE", name: "Réunion" },
  { code: "+263", country: "ZW", name: "Zimbabwe" },
  { code: "+264", country: "NA", name: "Namibia" },
  { code: "+265", country: "MW", name: "Malawi" },
  { code: "+266", country: "LS", name: "Lesotho" },
  { code: "+267", country: "BW", name: "Botswana" },
  { code: "+268", country: "SZ", name: "Eswatini" },
  { code: "+269", country: "KM", name: "Comoros" },
  { code: "+290", country: "SH", name: "Saint Helena" },
  { code: "+291", country: "ER", name: "Eritrea" },
  { code: "+297", country: "AW", name: "Aruba" },
  { code: "+298", country: "FO", name: "Faroe Islands" },
  { code: "+299", country: "GL", name: "Greenland" },
  { code: "+350", country: "GI", name: "Gibraltar" },
  { code: "+351", country: "PT", name: "Portugal" },
  { code: "+352", country: "LU", name: "Luxembourg" },
  { code: "+353", country: "IE", name: "Ireland" },
  { code: "+354", country: "IS", name: "Iceland" },
  { code: "+355", country: "AL", name: "Albania" },
  { code: "+356", country: "MT", name: "Malta" },
  { code: "+357", country: "CY", name: "Cyprus" },
  { code: "+358", country: "FI", name: "Finland" },
  { code: "+359", country: "BG", name: "Bulgaria" },
  { code: "+370", country: "LT", name: "Lithuania" },
  { code: "+371", country: "LV", name: "Latvia" },
  { code: "+372", country: "EE", name: "Estonia" },
  { code: "+373", country: "MD", name: "Moldova" },
  { code: "+374", country: "AM", name: "Armenia" },
  { code: "+375", country: "BY", name: "Belarus" },
  { code: "+376", country: "AD", name: "Andorra" },
  { code: "+377", country: "MC", name: "Monaco" },
  { code: "+378", country: "SM", name: "San Marino" },
  { code: "+379", country: "VA", name: "Vatican City" },
  { code: "+380", country: "UA", name: "Ukraine" },
  { code: "+381", country: "RS", name: "Serbia" },
  { code: "+382", country: "ME", name: "Montenegro" },
  { code: "+383", country: "XK", name: "Kosovo" },
  { code: "+385", country: "HR", name: "Croatia" },
  { code: "+386", country: "SI", name: "Slovenia" },
  { code: "+387", country: "BA", name: "Bosnia and Herzegovina" },
  { code: "+389", country: "MK", name: "North Macedonia" },
  { code: "+420", country: "CZ", name: "Czech Republic" },
  { code: "+421", country: "SK", name: "Slovakia" },
  { code: "+423", country: "LI", name: "Liechtenstein" },
  { code: "+500", country: "FK", name: "Falkland Islands" },
  { code: "+501", country: "BZ", name: "Belize" },
  { code: "+502", country: "GT", name: "Guatemala" },
  { code: "+503", country: "SV", name: "El Salvador" },
  { code: "+504", country: "HN", name: "Honduras" },
  { code: "+505", country: "NI", name: "Nicaragua" },
  { code: "+506", country: "CR", name: "Costa Rica" },
  { code: "+507", country: "PA", name: "Panama" },
  { code: "+508", country: "PM", name: "Saint Pierre and Miquelon" },
  { code: "+509", country: "HT", name: "Haiti" },
  { code: "+590", country: "GP", name: "Guadeloupe" },
  { code: "+591", country: "BO", name: "Bolivia" },
  { code: "+592", country: "GY", name: "Guyana" },
  { code: "+593", country: "EC", name: "Ecuador" },
  { code: "+594", country: "GF", name: "French Guiana" },
  { code: "+595", country: "PY", name: "Paraguay" },
  { code: "+596", country: "MQ", name: "Martinique" },
  { code: "+597", country: "SR", name: "Suriname" },
  { code: "+598", country: "UY", name: "Uruguay" },
  { code: "+599", country: "CW", name: "Curaçao" },
  { code: "+670", country: "TL", name: "East Timor" },
  { code: "+672", country: "NF", name: "Norfolk Island" },
  { code: "+673", country: "BN", name: "Brunei" },
  { code: "+674", country: "NR", name: "Nauru" },
  { code: "+675", country: "PG", name: "Papua New Guinea" },
  { code: "+676", country: "TO", name: "Tonga" },
  { code: "+677", country: "SB", name: "Solomon Islands" },
  { code: "+678", country: "VU", name: "Vanuatu" },
  { code: "+679", country: "FJ", name: "Fiji" },
  { code: "+680", country: "PW", name: "Palau" },
  { code: "+681", country: "WF", name: "Wallis and Futuna" },
  { code: "+682", country: "CK", name: "Cook Islands" },
  { code: "+683", country: "NU", name: "Niue" },
  { code: "+685", country: "WS", name: "Samoa" },
  { code: "+686", country: "KI", name: "Kiribati" },
  { code: "+687", country: "NC", name: "New Caledonia" },
  { code: "+688", country: "TV", name: "Tuvalu" },
  { code: "+689", country: "PF", name: "French Polynesia" },
  { code: "+690", country: "TK", name: "Tokelau" },
  { code: "+691", country: "FM", name: "Micronesia" },
  { code: "+692", country: "MH", name: "Marshall Islands" },
  { code: "+850", country: "KP", name: "North Korea" },
  { code: "+852", country: "HK", name: "Hong Kong" },
  { code: "+853", country: "MO", name: "Macau" },
  { code: "+855", country: "KH", name: "Cambodia" },
  { code: "+856", country: "LA", name: "Laos" },
  { code: "+880", country: "BD", name: "Bangladesh" },
  { code: "+886", country: "TW", name: "Taiwan" },
  { code: "+960", country: "MV", name: "Maldives" },
  { code: "+961", country: "LB", name: "Lebanon" },
  { code: "+962", country: "JO", name: "Jordan" },
  { code: "+963", country: "SY", name: "Syria" },
  { code: "+964", country: "IQ", name: "Iraq" },
  { code: "+965", country: "KW", name: "Kuwait" },
  { code: "+966", country: "SA", name: "Saudi Arabia" },
  { code: "+967", country: "YE", name: "Yemen" },
  { code: "+968", country: "OM", name: "Oman" },
  { code: "+970", country: "PS", name: "Palestine" },
  { code: "+971", country: "AE", name: "United Arab Emirates" },
  { code: "+972", country: "IL", name: "Israel" },
  { code: "+973", country: "BH", name: "Bahrain" },
  { code: "+974", country: "QA", name: "Qatar" },
  { code: "+975", country: "BT", name: "Bhutan" },
  { code: "+976", country: "MN", name: "Mongolia" },
  { code: "+977", country: "NP", name: "Nepal" },
  { code: "+992", country: "TJ", name: "Tajikistan" },
  { code: "+993", country: "TM", name: "Turkmenistan" },
  { code: "+994", country: "AZ", name: "Azerbaijan" },
  { code: "+995", country: "GE", name: "Georgia" },
  { code: "+996", country: "KG", name: "Kyrgyzstan" },
  { code: "+998", country: "UZ", name: "Uzbekistan" },
  { code: "+1242", country: "BS", name: "Bahamas" },
  { code: "+1246", country: "BB", name: "Barbados" },
  { code: "+1264", country: "AI", name: "Anguilla" },
  { code: "+1268", country: "AG", name: "Antigua and Barbuda" },
  { code: "+1284", country: "VG", name: "British Virgin Islands" },
  { code: "+1340", country: "VI", name: "U.S. Virgin Islands" },
  { code: "+1345", country: "KY", name: "Cayman Islands" },
  { code: "+1441", country: "BM", name: "Bermuda" },
  { code: "+1473", country: "GD", name: "Grenada" },
  { code: "+1649", country: "TC", name: "Turks and Caicos Islands" },
  { code: "+1664", country: "MS", name: "Montserrat" },
  { code: "+1671", country: "GU", name: "Guam" },
  { code: "+1684", country: "AS", name: "American Samoa" },
  { code: "+1758", country: "LC", name: "Saint Lucia" },
  { code: "+1767", country: "DM", name: "Dominica" },
  { code: "+1784", country: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "+1787", country: "PR", name: "Puerto Rico" },
  { code: "+1809", country: "DO", name: "Dominican Republic" },
  { code: "+1868", country: "TT", name: "Trinidad and Tobago" },
  { code: "+1869", country: "KN", name: "Saint Kitts and Nevis" },
  { code: "+1876", country: "JM", name: "Jamaica" },
  { code: "+1939", country: "PR", name: "Puerto Rico" },
];

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

// Function to convert formatted phone to standardized format
function standardizePhoneNumber(
  countryCode: string,
  formattedPhone: string
): string {
  // Remove all non-digit characters from the formatted phone
  const digits = formattedPhone.replace(/\D/g, "");

  // Remove the country code from the formatted phone if it's already included
  const countryCodeDigits = countryCode.replace(/\D/g, "");
  let phoneDigits = digits;

  if (digits.startsWith(countryCodeDigits)) {
    phoneDigits = digits.slice(countryCodeDigits.length);
  }

  // Return the standardized format: country code + phone digits
  return countryCodeDigits + phoneDigits;
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
  age: initialAge = "",
  gender: initialGender = "",
  onClose,
}: PhoneRequiredModalProps) {
  const [step, setStep] = useState(startStep);
  const [phone, setPhone] = useState(initialPhone);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneError, setPhoneError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1"); // Default to US
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [age, setAge] = useState(initialAge);
  const [ageError, setAgeError] = useState("");
  const [gender, setGender] = useState(initialGender);
  const [genderError, setGenderError] = useState("");

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

  useEffect(() => {
    setAge(initialAge);
  }, [initialAge]);

  useEffect(() => {
    setGender(initialGender);
  }, [initialGender]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

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
    if (!validateAge(age) || !validateGender(gender)) {
      return;
    }
    const formattedFirstName = formatName(firstName);
    const formattedLastName = formatName(lastName);
    const standardizedPhone = standardizePhoneNumber(
      selectedCountryCode,
      phone
    );
    await onSave(
      standardizedPhone,
      formattedFirstName,
      formattedLastName,
      age,
      gender
    );
    setSuccess(true);
  };

  // Skip step 1 if phone number is already provided
  useEffect(() => {
    if (initialPhone && step === 1) {
      setStep(2);
    }
  }, [initialPhone, step]);

  // Age validation
  const validateAge = (ageValue: string) => {
    const ageNum = parseInt(ageValue);
    if (!ageValue) {
      setAgeError("Age is required");
      return false;
    }
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setAgeError("Age must be between 13 and 120");
      return false;
    }
    setAgeError("");
    return true;
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAge(value);
    if (value) {
      validateAge(value);
    } else {
      setAgeError("");
    }
  };

  // Gender validation
  const validateGender = (value: string) => {
    if (!value) {
      setGenderError("Gender is required");
      return false;
    }
    setGenderError("");
    return true;
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
    validateGender(e.target.value);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
        fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        pointerEvents: fadeIn ? "auto" : "none",
        transition: "opacity 0.5s, transform 0.5s",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                step === 1 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></span>
            <span
              className={`w-3 h-3 rounded-full ${
                step === 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></span>
          </div>
        </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Updated!
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Your information has been saved successfully.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
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
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowCountrySelector(!showCountrySelector)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-sm font-medium min-w-[80px] flex items-center justify-between"
                      >
                        <span>{selectedCountryCode}</span>
                        <svg
                          className={`w-4 h-4 ml-1 transition-transform ${
                            showCountrySelector ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Country Code Dropdown */}
                      {showCountrySelector && (
                        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search countries..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => {
                                  setSelectedCountryCode(country.code);
                                  setShowCountrySelector(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                                  selectedCountryCode === country.code
                                    ? "bg-indigo-50 text-indigo-600"
                                    : ""
                                }`}
                              >
                                <span className="flex items-center">
                                  <span className="font-medium">
                                    {country.code}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {country.name}
                                  </span>
                                </span>
                                {selectedCountryCode === country.code && (
                                  <svg
                                    className="w-4 h-4 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="(555) 123-4567"
                      disabled={loading}
                      maxLength={14}
                    />
                  </div>
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
                {/* Age input field */}
                <div className="mb-4">
                  <label
                    htmlFor="age"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={handleAgeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Enter your age"
                    disabled={loading}
                  />
                </div>
                {ageError && (
                  <div className="text-red-500 text-xs mb-2">{ageError}</div>
                )}
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
                <div className="mb-4">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={handleGenderChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {genderError && (
                    <div className="text-red-500 text-xs mt-1">
                      {genderError}
                    </div>
                  )}
                </div>
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
                    disabled={
                      loading ||
                      !firstName ||
                      !lastName ||
                      !age ||
                      !!ageError ||
                      !gender ||
                      !!genderError
                    }
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
