import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    "auth/invalid-login-credentials":
      "Invalid email or password. Please try again.",
    "firestore/permission-denied":
      "Account signed in, but profile access is blocked. Contact support.",
    "permission-denied":
      "Account signed in, but profile access is blocked. Contact support.",
    "unavailable":
      "Service is temporarily unavailable. Please try again in a moment.",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, userLoading] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect if user is already logged in (but only after a brief delay to prevent flash)
  useEffect(() => {
    if (user && !userLoading) {
      const timer = setTimeout(() => {
        onClose();
        // Only navigate to dashboard if we're on the login page
        if (window.location.pathname === "/login") {
          navigate("/dashboard");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, userLoading, navigate, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const newUser = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          loginCount: 1,
          totalMessages: 0,
          totalAnalytics: 0,
          profile: {
            name: "",
            phone: "",
            personality: "BoJackHorseman",
            relationship: "Friend",
            avatar: "",
          },
          preferences: {
            notifications: true,
            theme: "light",
          },
          subscription: {
            plan: "free",
            status: "active",
            startDate: serverTimestamp(),
            endDate: null,
          },
        });

        // Update analytics
        try {
          await runTransaction(db, async (transaction) => {
            const analyticsRef = doc(db, "analytics", "user_signups");
            const analyticsDoc = await transaction.get(analyticsRef);

            if (analyticsDoc.exists()) {
              transaction.update(analyticsRef, {
                totalSignups: increment(1),
                lastSignupAt: serverTimestamp(),
                signupsByDay: arrayUnion({
                  date: new Date().toISOString().split("T")[0],
                  count: 1,
                }),
              });
            } else {
              transaction.set(analyticsRef, {
                totalSignups: 1,
                lastSignupAt: serverTimestamp(),
                signupsByDay: [
                  {
                    date: new Date().toISOString().split("T")[0],
                    count: 1,
                  },
                ],
              });
            }
          });
        } catch (analyticsError) {
          console.error("Error updating analytics:", analyticsError);
        }
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const existingUser = userCredential.user;

        // Best-effort profile tracking. Never block successful auth on this.
        try {
          const userRef = doc(db, "users", existingUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            await setDoc(
              userRef,
              {
                lastLoginAt: serverTimestamp(),
                loginCount: increment(1),
              },
              { merge: true }
            );
          }
        } catch (trackingError) {
          console.error("Login metadata update failed:", trackingError);
        }
      }

      // Close modal and redirect to dashboard (only if on login page)
      onClose();
      if (window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
            <div className="px-8 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show modal if user is already logged in and not loading
  if (user && !userLoading) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src="/images/punkgirl.png"
                alt="SwanAI Avatar"
                className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? "Join SwanAI" : "Welcome Back"}
              </h2>
              <p className="text-gray-600">
                {isSignUp
                  ? "Create your account to start your journey"
                  : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </div>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle between sign in and sign up */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  Personalized AI companions
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  Web chat & text messaging
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  Emotional support & privacy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
