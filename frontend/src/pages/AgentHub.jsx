import React, { useState } from "react";
import { RefreshCcw } from "lucide-react"; // Only keeping icons you still use

export default function AgentHubPage() {
  const [autoScan, setAutoScan] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Discover Agents Section */}
      <h2 className="text-lg font-semibold">Discover Agents</h2>
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded">
            Scan for Agents
          </button>

          {/* Reload Icon Button */}
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Reload"
          >
            <RefreshCcw className="w-5 h-5 text-gray-700" />
          </button>

          {/* Auto-scan Toggle */}
          <label
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setAutoScan(!autoScan)}
          >
            <span className="text-sm text-gray-600">Auto-scan</span>
            <div
              className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                autoScan ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoScan ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                autoScan ? "text-green-600" : "text-red-500"
              }`}
            >
              {autoScan ? "ON" : "OFF"}
            </span>
          </label>
        </div>
        <p className="text-sm text-gray-500">Last scanned: 2 minutes ago</p>
      </div>

      {/* Active Agents Section */}
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <table className="w-full table-fixed text-sm text-left text-gray-700">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="py-2 w-1/4">Nickname</th>
              <th className="py-2 w-1/4">Operating System</th>
              <th className="py-2 w-1/4">Status</th>
              <th className="py-2 w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-3">Agent-001</td>
              <td className="py-3 flex items-center space-x-2">
                <span>Windows</span>
              </td>
              <td className="py-3 text-green-600">● online</td>
              <td className="py-3 space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Connect
                </button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                  Start Scan
                </button>
              </td>
            </tr>
            <tr>
              <td className="py-3">Agent-002</td>
              <td className="py-3 flex items-center space-x-2">
                <span>Linux</span>
              </td>
              <td className="py-3 text-yellow-500">● idle</td>
              <td className="py-3 space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Connect
                </button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                  Start Scan
                </button>
              </td>
            </tr>
            <tr>
              <td className="py-3">Agent-003</td>
              <td className="py-3 flex items-center space-x-2">
                <span>macOS</span>
              </td>
              <td className="py-3 text-blue-600">● listening</td>
              <td className="py-3 space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded">
                  Connect
                </button>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                  Start Scan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Disconnected Agents Section */}
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <table className="w-full table-fixed text-sm text-left text-gray-700">
          <thead className="text-xs uppercase text-gray-500 border-b">
            <tr>
              <th className="py-2 w-1/5">Nickname</th>
              <th className="py-2 w-1/5">Operating System</th>
              <th className="py-2 w-1/5">Status</th>
              <th className="py-2 w-2/5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-3">Agent-004</td>
              <td className="py-3 flex items-center space-x-2">
                <span>Windows</span>
              </td>
              <td className="py-3 text-red-500">● offline</td>
              <td className="py-3">
                <div className="flex flex-nowrap gap-2">
                  <button
                    className="bg-gray-300 text-gray-500 px-3 py-1 rounded"
                    disabled
                  >
                    Connect
                  </button>
                  <button
                    className="bg-gray-300 text-gray-500 px-3 py-1 rounded"
                    disabled
                  >
                    Start Scan
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                    Retry Connection
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-3">Agent-005</td>
              <td className="py-3 flex items-center space-x-2">
                <span>Linux</span>
              </td>
              <td className="py-3 text-red-500">● offline</td>
              <td className="py-3">
                <div className="flex flex-nowrap gap-2">
                  <button
                    className="bg-gray-300 text-gray-500 px-3 py-1 rounded"
                    disabled
                  >
                    Connect
                  </button>
                  <button
                    className="bg-gray-300 text-gray-500 px-3 py-1 rounded"
                    disabled
                  >
                    Start Scan
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                    Retry Connection
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
