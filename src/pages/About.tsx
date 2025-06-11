import React from "react";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import SlimFooter from "../components/SlimFooter";

const team = [
  {
    name: "Zablon Charles",
    role: "Founder & CEO",
    image: "/images/p1.png",
    socials: [
      { icon: <FaTwitter />, url: "#" },
      { icon: <FaLinkedin />, url: "#" },
      { icon: <FaInstagram />, url: "#" },
    ],
  },
  {
    name: "Venessa Cristy",
    role: "Chief Technology Officer",
    image: "/images/p2.png",
    socials: [
      { icon: <FaTwitter />, url: "#" },
      { icon: <FaLinkedin />, url: "#" },
      { icon: <FaInstagram />, url: "#" },
    ],
  },
  {
    name: "Katy Sterling",
    role: "Chief Technology Officer",
    image: "/images/p3.png",
    socials: [
      { icon: <FaTwitter />, url: "#" },
      { icon: <FaLinkedin />, url: "#" },
      { icon: <FaInstagram />, url: "#" },
    ],
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-20 flex-1">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 leading-tight">
            Meet our team of creators, designers, and world-class problem
            solvers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            To become the company that customers want, it takes a group of
            passionate people. Get to know the people who lead
          </p>
        </div>
        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {team.map((member, idx) => (
            <div
              key={member.name}
              className="flex flex-col items-center bg-white rounded-2xl p-6"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-40 h-40 object-cover rounded-2xl mb-4 shadow"
              />
              <div className="text-lg font-bold text-black mb-1">
                {member.name}
              </div>
              <div className="text-sm text-gray-500 mb-3">{member.role}</div>
              <div className="flex gap-3">
                {member.socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600 text-xl transition"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Join Our Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-black mb-4">
              Join our team, The one with the master touch
            </h2>
          </div>
          <div>
            <p className="text-gray-700 mb-4">
              We believe it takes great people to make a great product. That's
              why we hire not only the perfect professional fits, but people who
              embody our company values.
            </p>
            <a
              href="#"
              className="font-semibold text-black hover:text-indigo-600 transition inline-flex items-center"
            >
              See Open Position <span className="ml-2">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-black mb-12">
          SwanAI by the Numbers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-5xl font-extrabold text-black mb-2">
              99.99%
            </div>
            <div className="text-lg font-bold text-black mb-2">
              Uptime Reliability
            </div>
            <div className="text-gray-600 text-base">
              SwanAI is built for reliability. Our platform maintains 99.99%
              uptime, ensuring your SMS automations and conversations are always
              available when you need them most.
            </div>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-black mb-2">1M+</div>
            <div className="text-lg font-bold text-black mb-2">
              Messages Delivered
            </div>
            <div className="text-gray-600 text-base">
              Our AI assistant has powered over 1 million SMS messages for
              businesses and individuals, helping users automate, personalize,
              and analyze their communications at scale.
            </div>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-black mb-2">20+</div>
            <div className="text-lg font-bold text-black mb-2">
              Countries Served
            </div>
            <div className="text-gray-600 text-base">
              SwanAI is trusted by users in more than 20 countries, supporting
              global communication needs with secure, privacy-first technology
              and multilingual capabilities.
            </div>
          </div>
        </div>
      </div>
      <SlimFooter />
    </div>
  );
}
