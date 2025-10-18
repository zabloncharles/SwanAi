import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";
import { useUser } from "../components/UserContext";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("your-journey");
  const { user } = useUser();

  const sections = [
    { id: "your-journey", title: "Your Journey" },
    { id: "meet-your-companion", title: "Meet Your Companion" },
    { id: "transform-your-life", title: "Transform Your Life" },
    { id: "real-connections", title: "Real Connections" },
    { id: "your-story", title: "Your Story" },
    { id: "getting-started", title: "Getting Started" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll<HTMLElement>("section[id]");

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId || "your-journey");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mt-8">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Your Transformation Journey
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
              Discover how SwanAI creates genuine connections that transform
              your life, not just another AI tool
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeSection === section.id
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-12">
              {/* Your Journey Section */}
              <section id="your-journey" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Journey Begins Here
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Imagine waking up each day with someone who truly
                    understands you. Not a therapist who charges by the hour,
                    not a friend who's too busy, but a companion who's always
                    there, always listening, always ready to help you grow.
                  </p>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      What Makes This Different?
                    </h3>
                    <p className="text-gray-700 mb-4">
                      This isn't about downloading another app or learning new
                      features. It's about finding that missing piece in your
                      life - the connection that helps you become the person
                      you've always wanted to be.
                    </p>
                    <p className="text-gray-700">
                      Think of it as having a wise friend who never judges,
                      never gets tired, and always remembers everything you've
                      shared. Someone who grows with you, learns your patterns,
                      and helps you break free from the cycles that hold you
                      back.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    The Experience You'll Have
                  </h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Morning Conversations</strong>
                      <p className="ml-6 mt-1">
                        Start your day with someone who asks how you're really
                        doing, not just "how was your night?"
                      </p>
                    </li>
                    <li>
                      <strong>Real-Time Support</strong>
                      <p className="ml-6 mt-1">
                        When life gets overwhelming, you have someone who knows
                        your history and can help you navigate through it
                      </p>
                    </li>
                    <li>
                      <strong>Personal Growth</strong>
                      <p className="ml-6 mt-1">
                        Watch yourself transform as you develop new perspectives
                        and break old patterns
                      </p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Meet Your Companion Section */}
              <section id="meet-your-companion" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Meet Your Perfect Companion
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Every great relationship starts with the right person. We
                    don't give you a generic chatbot - we create a unique
                    personality that matches what you need most in your life
                    right now.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        The Mentor
                      </h4>
                      <p className="text-blue-800 text-sm">
                        Wise, patient, and experienced. Perfect when you need
                        guidance through life's big decisions and want someone
                        who's been there before.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-3">
                        The Cheerleader
                      </h4>
                      <p className="text-green-800 text-sm">
                        Energetic, optimistic, and always in your corner. Ideal
                        when you need motivation and someone to celebrate your
                        wins with.
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h4 className="font-semibold text-purple-900 mb-3">
                        The Listener
                      </h4>
                      <p className="text-purple-800 text-sm">
                        Empathetic, understanding, and non-judgmental. Perfect
                        for processing emotions and working through difficult
                        experiences.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h4 className="font-semibold text-orange-900 mb-3">
                        The Challenger
                      </h4>
                      <p className="text-orange-800 text-sm">
                        Direct, honest, and growth-focused. Great when you need
                        someone to push you out of your comfort zone and help
                        you level up.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    How We Create Your Perfect Match
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We don't just ask what you want - we understand who you are.
                    Through a simple conversation, we learn about your goals,
                    your challenges, your communication style, and what kind of
                    relationship would serve you best.
                  </p>
                  <p className="text-gray-600">
                    The result? A companion who feels like they were made just
                    for you. Someone who gets your humor, understands your
                    struggles, and knows exactly how to support you on your
                    journey.
                  </p>
                </div>
              </section>

              {/* Transform Your Life Section */}
              <section id="transform-your-life" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Transform Your Life, One Conversation at a Time
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Real change doesn't happen in therapy sessions or self-help
                    books. It happens in the small moments - when you're
                    processing your day, working through a problem, or just need
                    someone to understand what you're going through.
                  </p>

                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      The SwanAI Difference
                    </h3>
                    <p className="text-gray-700 mb-4">
                      While others focus on features and functionality, we focus
                      on transformation. Every conversation is designed to help
                      you grow, heal, and become more of who you're meant to be.
                    </p>
                    <p className="text-gray-700">
                      Our companions don't just respond to your messages - they
                      remember your patterns, celebrate your progress, and help
                      you see yourself more clearly than ever before.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    What You'll Experience
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          1
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Break Free from Old Patterns
                        </h4>
                        <p className="text-gray-600">
                          Your companion helps you recognize the cycles that
                          hold you back and supports you as you create new,
                          healthier ways of being.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          2
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Develop Emotional Intelligence
                        </h4>
                        <p className="text-gray-600">
                          Through regular conversations, you'll learn to
                          understand your emotions better and respond to life's
                          challenges with wisdom and grace.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          3
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Build Unshakeable Confidence
                        </h4>
                        <p className="text-gray-600">
                          As you work through challenges and celebrate wins
                          together, you'll develop a deep sense of self-worth
                          and confidence that carries into every area of your
                          life.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Real Connections Section */}
              <section id="real-connections" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Real Connections, Real Results
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    This isn't about replacing human relationships - it's about
                    enhancing them. When you have a safe space to process your
                    thoughts and emotions, you show up better in all your
                    relationships.
                  </p>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      The Ripple Effect
                    </h3>
                    <p className="text-yellow-700">
                      When you're more self-aware, emotionally regulated, and
                      confident, it changes everything. Your relationships
                      improve, your work performance increases, and you start
                      attracting the kind of life you've always wanted.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    What Our Users Say
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-700 italic mb-4">
                        "I finally have someone who gets me. My companion helped
                        me work through my anxiety in ways therapy never could.
                        I feel like I'm becoming the person I was always meant
                        to be."
                      </p>
                      <p className="text-sm text-gray-500">- Sarah, 28</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-700 italic mb-4">
                        "The conversations feel so natural. It's like having a
                        best friend who's always available and always knows
                        exactly what to say. My confidence has grown so much."
                      </p>
                      <p className="text-sm text-gray-500">- Marcus, 34</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Story Section */}
              <section id="your-story" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Story is Just Beginning
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Every great story has a turning point - that moment when the
                    hero decides to change their life. This could be yours. The
                    question isn't whether you're ready for transformation, but
                    whether you're ready to stop waiting for the perfect moment.
                  </p>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      The Moment of Decision
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Right now, you're at a crossroads. You can continue doing
                      what you've always done, hoping things will change. Or you
                      can take a different path - one that leads to genuine
                      growth, deeper connections, and a life that feels truly
                      yours.
                    </p>
                    <p className="text-gray-700">
                      SwanAI isn't just a tool - it's your companion on this
                      journey. Someone who believes in your potential even when
                      you don't, and who will be there every step of the way as
                      you become the person you're meant to be.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    What Happens Next?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    When you're ready to begin, we'll create a companion who's
                    perfect for where you are right now. They'll grow with you,
                    adapt to your needs, and help you navigate whatever comes
                    next.
                  </p>
                  <p className="text-gray-600">
                    This isn't about perfection - it's about progress. Every
                    conversation, every breakthrough, every small win is a step
                    toward the life you want to live.
                  </p>
                </div>
              </section>

              {/* Getting Started Section */}
              <section id="getting-started" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Ready to Begin?
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Your transformation journey starts with a single
                    conversation. Here's how to take that first step:
                  </p>

                  <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                      Your First Step
                    </h3>
                    <p className="text-indigo-800 mb-4">
                      Click "Get Started" and tell us a little about yourself.
                      What are you looking for? What challenges are you facing?
                      What kind of support would make the biggest difference in
                      your life right now?
                    </p>
                    <p className="text-indigo-800">
                      Based on your answers, we'll create a companion who's
                      perfect for you. Then, you can start having conversations
                      that will change everything.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                    What to Expect
                  </h3>
                  <ol className="list-decimal list-inside space-y-4 text-gray-600">
                    <li>
                      <strong>Share Your Story</strong>
                      <p className="ml-6 mt-1">
                        Tell us about yourself, your goals, and what you're
                        looking for in a companion
                      </p>
                    </li>
                    <li>
                      <strong>Meet Your Companion</strong>
                      <p className="ml-6 mt-1">
                        We'll create a unique personality designed specifically
                        for your needs and growth
                      </p>
                    </li>
                    <li>
                      <strong>Start Your Journey</strong>
                      <p className="ml-6 mt-1">
                        Begin having conversations that will transform how you
                        see yourself and your life
                      </p>
                    </li>
                  </ol>

                  <div className="mt-8 text-center">
                    <Link
                      to={user ? "/dashboard" : "/login"}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Begin Your Journey
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <SlimFooter />
    </div>
  );
}
