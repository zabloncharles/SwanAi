import React, { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

type CheckinStatus = "pending" | "responded_ok" | "responded" | "needs_attention" | "missed";

interface CareRecipient {
  id: string;
  name: string;
  monitoredPhone: string;
  normalizedMonitoredPhone: string;
  timezone: string;
  checkinHour: number;
  checkinMinute: number;
  checkinMessage?: string;
  caregiverIds: string[];
  active: boolean;
}

interface DayCheckin {
  dateKey: string;
  status: CheckinStatus;
  responseText?: string;
  sentAt?: string | null;
  respondedAt?: string | null;
}

function normalizePhoneNumber(phone: string): string {
  const cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.length === 10) return `1${cleaned}`;
  return cleaned;
}

function getMonthDayKeys(year: number, monthIndex: number): string[] {
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const list: string[] = [];
  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, monthIndex, day);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    list.push(key);
  }
  return list;
}

export default function HealthDashboard() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [checkinsByDate, setCheckinsByDate] = useState<Record<string, DayCheckin>>(
    {}
  );
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createTimezone, setCreateTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  );
  const [createHour, setCreateHour] = useState(9);
  const [createMinute, setCreateMinute] = useState(0);
  const [createMessage, setCreateMessage] = useState("Are you okay?");
  const [error, setError] = useState("");

  const selectedRecipient = useMemo(
    () => recipients.find((r) => r.id === selectedRecipientId) || null,
    [recipients, selectedRecipientId]
  );

  const dayKeys = useMemo(
    () => getMonthDayKeys(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor]
  );

  const loadRecipients = async (uid: string, admin: boolean) => {
    const recipientsRef = collection(db, "careRecipients");
    const recipientsQuery = admin
      ? query(recipientsRef, where("active", "==", true))
      : query(
          recipientsRef,
          where("active", "==", true),
          where("caregiverIds", "array-contains", uid)
        );
    const snapshot = await getDocs(recipientsQuery);
    const rows: CareRecipient[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CareRecipient, "id">),
    }));
    setRecipients(rows);
    if (rows.length > 0) {
      setSelectedRecipientId((prev) => prev || rows[0].id);
    } else {
      setSelectedRecipientId("");
    }
  };

  const loadCheckins = async (recipientId: string) => {
    if (!recipientId) {
      setCheckinsByDate({});
      return;
    }
    const monthStart = `${monthCursor.getFullYear()}-${String(
      monthCursor.getMonth() + 1
    ).padStart(2, "0")}-01`;
    const monthEnd = `${monthCursor.getFullYear()}-${String(
      monthCursor.getMonth() + 1
    ).padStart(2, "0")}-31`;

    const checkinsRef = collection(db, "careRecipients", recipientId, "checkins");
    const monthQuery = query(
      checkinsRef,
      where("dateKey", ">=", monthStart),
      where("dateKey", "<=", monthEnd)
    );
    const snapshot = await getDocs(monthQuery);
    const mapped: Record<string, DayCheckin> = {};
    snapshot.docs.forEach((d) => {
      const row = d.data() as DayCheckin;
      mapped[row.dateKey] = row;
    });
    setCheckinsByDate(mapped);
  };

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        const admin = userData?.type === "admin" || userData?.isAdmin === true;
        setIsAdmin(admin);
        await loadRecipients(user.uid, admin);
      } catch (e: any) {
        setError(e?.message || "Failed to load recipients");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  useEffect(() => {
    loadCheckins(selectedRecipientId);
  }, [selectedRecipientId, monthCursor]);

  const handleCreateRecipient = async () => {
    if (!user) return;
    setError("");
    const normalizedPhone = normalizePhoneNumber(createPhone);
    if (!createName.trim() || !normalizedPhone) {
      setError("Recipient name and valid phone are required.");
      return;
    }
    try {
      const row = {
        name: createName.trim(),
        monitoredPhone: normalizedPhone,
        normalizedMonitoredPhone: normalizedPhone,
        timezone: createTimezone,
        checkinHour: Number(createHour),
        checkinMinute: Number(createMinute),
        checkinMessage: createMessage.trim() || "Are you okay?",
        caregiverIds: [user.uid],
        active: true,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "careRecipients"), row);
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await setDoc(
        doc(db, "careRecipients", docRef.id, "checkins", todayKey),
        {
          dateKey: todayKey,
          status: "pending",
          sentAt: null,
          respondedAt: null,
          responseText: "",
        },
        { merge: true }
      );
      await loadRecipients(user.uid, isAdmin);
      setSelectedRecipientId(docRef.id);
      setCreateName("");
      setCreatePhone("");
    } catch (e: any) {
      setError(e?.message || "Failed to create recipient.");
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {isAdmin ? "All Recipients" : "My Recipients"}
            </h2>
            <div className="space-y-2 mb-5">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipientId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${
                    selectedRecipientId === r.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">
                    {r.monitoredPhone} | {String(r.checkinHour).padStart(2, "0")}:
                    {String(r.checkinMinute).padStart(2, "0")} {r.timezone}
                  </div>
                </button>
              ))}
              {recipients.length === 0 && (
                <div className="text-sm text-gray-500">No recipients yet.</div>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Add Recipient
            </h3>
            <div className="space-y-2">
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Name (e.g., Mom)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="Phone (E.164 or digits)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={createHour}
                  min={0}
                  max={23}
                  onChange={(e) => setCreateHour(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={createMinute}
                  min={0}
                  max={59}
                  onChange={(e) => setCreateMinute(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <input
                value={createTimezone}
                onChange={(e) => setCreateTimezone(e.target.value)}
                placeholder="Timezone (e.g., America/New_York)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={createMessage}
                onChange={(e) => setCreateMessage(e.target.value)}
                placeholder="Check-in message"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleCreateRecipient}
                className="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700"
              >
                Save Recipient
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRecipient ? `${selectedRecipient.name} Check-ins` : "Check-ins"}
                </h2>
                <p className="text-sm text-gray-500">
                  Green = responded, Red X = missed/needs attention, Gray = pending/no response
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setMonthCursor(
                      new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)
                    )
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  Prev
                </button>
                <div className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                  {monthCursor.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={() =>
                    setMonthCursor(
                      new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
                    )
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs text-gray-500 text-center py-1">
                  {d}
                </div>
              ))}
              {dayKeys.map((dateKey) => {
                const date = new Date(`${dateKey}T00:00:00`);
                const status = checkinsByDate[dateKey]?.status;
                const isResponded = status === "responded_ok" || status === "responded";
                const isMissed = status === "missed" || status === "needs_attention";

                return (
                  <div
                    key={dateKey}
                    className={`h-16 rounded-lg border flex flex-col items-center justify-center ${
                      isResponded
                        ? "bg-emerald-100 border-emerald-300"
                        : isMissed
                        ? "bg-red-100 border-red-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    title={
                      checkinsByDate[dateKey]?.responseText
                        ? `${dateKey}: ${checkinsByDate[dateKey].responseText}`
                        : dateKey
                    }
                  >
                    <div className="text-xs text-gray-700">{date.getDate()}</div>
                    <div className="text-lg leading-none">
                      {isResponded ? "✓" : isMissed ? "✕" : "•"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
