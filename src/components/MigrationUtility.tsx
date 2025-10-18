import React, { useState } from "react";
import { MigrationService, MigrationStats } from "../services/migrationService";

export default function MigrationUtility() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [migrationStats, setMigrationStats] = useState<any>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setStats(null);

    try {
      const result = await MigrationService.migrateAllChatData();
      setStats(result);
    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStats = async () => {
    try {
      const result = await MigrationService.getMigrationStats();
      setMigrationStats(result);
    } catch (error) {
      console.error("Failed to get stats:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Chat Data Migration Utility
      </h2>

      <div className="space-y-6">
        {/* Migration Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Migration Status</h3>
          <button
            onClick={getStats}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Get Current Stats
          </button>

          {migrationStats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-2xl font-bold">
                  {migrationStats.totalUsers}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Migrated Users</div>
                <div className="text-2xl font-bold text-green-600">
                  {migrationStats.migratedUsers}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Pending Users</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {migrationStats.pendingUsers}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Total Messages</div>
                <div className="text-2xl font-bold">
                  {migrationStats.totalMessages}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Migration Controls */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Run Migration</h3>
          <p className="text-gray-600 mb-4">
            This will migrate all existing chat data from user documents to the
            new chats collection.
            <strong className="text-red-600">
              {" "}
              This action cannot be undone!
            </strong>
          </p>

          <button
            onClick={runMigration}
            disabled={isRunning}
            className={`px-6 py-3 rounded font-semibold ${
              isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {isRunning ? "Migrating..." : "Start Migration"}
          </button>
        </div>

        {/* Migration Results */}
        {stats && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Migration Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Users Processed</div>
                <div className="text-2xl font-bold">{stats.usersProcessed}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Chats Migrated</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.chatsMigrated}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Messages Migrated</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.messagesMigrated}
                </div>
              </div>
            </div>

            {stats.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-semibold text-red-800 mb-2">
                  Errors ({stats.errors.length})
                </h4>
                <div className="space-y-1">
                  {stats.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
