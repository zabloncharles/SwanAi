import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MessageStats {
  date: string;
  count: number;
}

interface ResponseTimeStats {
  date: string;
  averageTime: number;
}

export default function Analytics() {
  return (
    <div className="max-w-2xl mx-auto py-24 text-center">
      <h2 className="text-2xl font-bold mb-4">
        Analytics are now part of your Dashboard
      </h2>
      <a
        href="/dashboard"
        className="text-indigo-600 hover:underline font-medium"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
