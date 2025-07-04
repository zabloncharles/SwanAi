import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  setDoc,
  doc,
  increment,
  runTransaction,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

// Function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use":
      "This email is already registered. Please try signing in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed":
      "Email/password accounts are not enabled. Please contact support.",
    "auth/weak-password":
      "Please choose a stronger password (at least 6 characters).",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found":
      "No account found with this email. Please check your email or sign up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
    "auth/popup-closed-by-user": "Sign-in window was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked":
      "Pop-up was blocked by your browser. Please allow pop-ups for this site.",
    "auth/account-exists-with-different-credential":
      "An account already exists with the same email address but different sign-in credentials.",
    "auth/credential-already-in-use":
      "This credential is already associated with a different user account.",
    "auth/requires-recent-login":
      "Please sign out and sign in again to perform this action.",
    "auth/invalid-credential": "Invalid login credentials. Please try again.",
    "auth/invalid-verification-code":
      "Invalid verification code. Please try again.",
    "auth/invalid-verification-id":
      "Invalid verification ID. Please try again.",
    "auth/missing-verification-code": "Please enter the verification code.",
    "auth/missing-verification-id":
      "Verification ID is missing. Please try again.",
    "auth/quota-exceeded": "Quota exceeded. Please try again later.",
    "auth/unauthorized-domain":
      "This domain is not authorized for OAuth operations.",
    "auth/unsupported-persistence-type":
      "The current environment does not support the requested persistence type.",
    "auth/expired-action-code":
      "The action code has expired. Please request a new one.",
    "auth/invalid-action-code":
      "The action code is invalid. Please request a new one.",
    "auth/missing-action-code":
      "The action code is missing. Please request a new one.",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again.";
};

async function getCityStateFromCoords(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SwanAI/1.0 (contact@swanai.com)" },
  });
  const data = await res.json();
  return {
    city: data.address.city || data.address.town || data.address.village || "",
    state: data.address.state || "",
    country: data.address.country || "",
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    // Check if we should show signup form
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Temporary debug - remove after fixing
    console.log(
      "Login attempt - API Key starts with:",
      import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + "..."
    );

    try {
      if (isSignUp) {
        // Handle sign up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Get user coordinates
        const coords = await getUserCoordinates();
        const cityState = await getCityStateFromCoords(coords.lat, coords.lng);

        // Create user document
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email || "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          personality: "",
          aiRelationship: "",
          notificationsEnabled: false,
          tokensUsed: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          location: {
            city: cityState.city,
            state: cityState.state,
            country: cityState.country,
            coordinates: coords,
          },
        });

        // Wait a bit for the document to be created
        let userDocExists = false;
        for (let i = 0; i < 5; i++) {
          const userSnap = await getDoc(userRef);
          userDocExists = userSnap.exists();
          if (userDocExists) break;
          await new Promise((res) => setTimeout(res, 200)); // Wait 200ms
        }
        if (userDocExists) {
          navigate("/dashboard");
          window.location.reload();
        } else {
          // fallback: still navigate, but warn in console
          console.warn("User doc not found after sign up, navigating anyway.");
          navigate("/dashboard");
          window.location.reload();
        }
      } else {
        // Handle sign in
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Get existing user data first
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const existingData = userSnap.exists() ? userSnap.data() : {};

        // Update last login time while preserving other data
        await setDoc(
          userRef,
          {
            ...existingData,
            lastLogin: serverTimestamp(),
            email: user.email || existingData.email || "",
            firstName: existingData.firstName || "",
            lastName: existingData.lastName || "",
            phoneNumber: existingData.phoneNumber || "",
            personality: existingData.personality || "",
            aiRelationship: existingData.aiRelationship || "",
            notificationsEnabled: existingData.notificationsEnabled || false,
            tokensUsed: existingData.tokensUsed || 0,
          },
          { merge: true }
        );

        // Navigate to dashboard after successful sign in
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorCode = err.code || "";
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCoordinates = async () => {
    // Always use IP-based lookup, never prompt for browser geolocation
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("IP lookup failed");
      const data = await res.json();
      return { lat: data.latitude, lng: data.longitude };
    } catch (error) {
      console.warn("Failed to get coordinates, using defaults");
      return { lat: 0, lng: 0 }; // Default coordinates
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <img
                src="/images/swanlogo.png"
                alt="SwanAI Logo"
                className="w-8 h-8"
              />
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                SwanAI
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp
                ? "Join SwanAI to start your AI-powered journey"
                : "Sign in to continue to your dashboard"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {isSignUp && (
              <div className="flex items-center mt-2">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  required
                />
                <label
                  htmlFor="privacy"
                  className="ml-2 block text-sm text-gray-700"
                >
                  I agree to the
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline ml-1"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || (isSignUp && !privacyAccepted)}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "Create account" : "Sign in"}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <img
            src="/images/loginpic.jpeg"
            alt="SwanAI Platform"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h2 className="text-4xl font-bold mb-6">
              Transform Your SMS Experience
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of businesses using SwanAI to make their text
              messages smarter and more personal.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>AI-powered responses</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Seamless integration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Advanced analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
