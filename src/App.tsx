import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Support from "./pages/Support";
import Pricing from "./pages/Pricing";
import { UserProvider } from "./components/UserContext";

function AppContent() {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Handle login modal based on URL
  useEffect(() => {
    if (location.pathname === "/login") {
      // Small delay to ensure smooth modal opening
      const timer = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Ensure modal is closed when not on login route
      setIsLoginModalOpen(false);
    }
  }, [location.pathname]);

  // Reset modal state when component mounts
  useEffect(() => {
    setIsLoginModalOpen(location.pathname === "/login");
  }, []);

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    // Navigate back to previous page or home
    if (location.pathname === "/login") {
      // Use navigate to properly trigger route change
      navigate("/", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
