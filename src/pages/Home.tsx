import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="w-full pt-20 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            The only SMS platform powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">advanced AI</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Make conversations smarter and more personal. Your AI SMS assistant for seamless, contextual, and natural texting.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow hover:bg-indigo-700 transition">Get Started</Link>
            <a href="#contact" className="px-6 py-3 bg-white border border-indigo-600 text-indigo-600 rounded-lg font-medium shadow hover:bg-indigo-50 transition">Chat with Us</a>
          </div>
          {/* Product Screenshot/Illustration */}
          <div className="mt-8 flex justify-center">
            <div className="rounded-2xl shadow-lg border border-gray-100 bg-white p-4 w-full max-w-2xl">
              <img src="/sms-demo.png" alt="AI SMS Assistant Demo" className="rounded-xl mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">We help you connect in the simplest way</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">Personalized AI</h3>
              <p className="text-gray-500 text-sm">Your assistant adapts to your style and preferences for every conversation.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">SMS Integration</h3>
              <p className="text-gray-500 text-sm">Chat naturally with your AI assistant through SMS, anytime and anywhere.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-500 text-sm">Track your usage and get insights into your conversations with detailed analytics.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z" /></svg>
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-500 text-sm">Your data is encrypted and never shared. Privacy and security are our top priorities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Our goal is to make AI accessible and helpful for everyone</h2>
          <p className="text-lg text-gray-500 mb-4">We believe technology should serve humanity. Our platform harnesses the power of AI to streamline communication and optimize outcomes.</p>
          <Link to="/about" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow hover:bg-indigo-700 transition">About Us</Link>
        </div>
      </section>

      {/* Getting Started / Case Studies */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">We'll help you get started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-2">How Sarah uses AI Buddy for productivity</h3>
              <p className="text-gray-500 text-sm mb-2">"AI Buddy helps me manage my day and never miss a task!"</p>
              <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">Read story</a>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-2">How John automates reminders with SMS</h3>
              <p className="text-gray-500 text-sm mb-2">"I love how easy it is to set up and get reminders via text."</p>
              <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">Read story</a>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-2">How teams use AI Buddy for support</h3>
              <p className="text-gray-500 text-sm mb-2">"Our support team is more efficient and responsive with AI Buddy."</p>
              <a href="#" className="text-indigo-600 text-sm font-medium hover:underline">Read story</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">Is my data secure with AI Buddy?</summary>
              <p className="text-gray-500 mt-2">Yes, your data is encrypted and never shared with third parties.</p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">Can I customize my AI assistant's personality?</summary>
              <p className="text-gray-500 mt-2">Absolutely! You can set your assistant's personality and preferences in the dashboard.</p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">How do I track my usage?</summary>
              <p className="text-gray-500 mt-2">You can view analytics and token usage in your dashboard at any time.</p>
            </details>
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium cursor-pointer">Is there a free trial?</summary>
              <p className="text-gray-500 mt-2">Yes, you can try AI Buddy for free with no credit card required.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f7f9fb] border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} AI Buddy. All rights reserved.</div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 