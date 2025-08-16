import {
  Monitor,
  Laptop,
  Terminal,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

export default function GenerateAgentPage() {
  const [nickname, setNickname] = useState("");
  const [os, setOs] = useState("");

  const agents = [
    {
      name: "Production Server",
      os: "Windows",
      icon: <Monitor className="w-5 h-5 text-blue-500" />,
      date: "2024-01-15",
    },
    {
      name: "Development Machine",
      os: "macOS",
      icon: <Laptop className="w-5 h-5 text-gray-700" />,
      date: "2024-01-14",
    },
    {
      name: "Database Server",
      os: "Linux",
      icon: <Terminal className="w-5 h-5 text-green-600" />,
      date: "2024-01-13",
    },
    {
      name: "Backup Server",
      os: "Windows",
      icon: <Monitor className="w-5 h-5 text-blue-500" />,
      date: "2024-01-12",
    },
    {
      name: "Test Environment",
      os: "Linux",
      icon: <Terminal className="w-5 h-5 text-green-600" />,
      date: "2024-01-11",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-white overflow-y-auto h-full">
      {/* Page Title */}
      <h2 className="text-gray-600 text-lg font-medium">Generate Agent</h2>

      {/* Generate Agent Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 border border-gray-100">
        <div className="w-full md:w-[65%] space-y-4">
          {/* Nickname and OS input row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Nickname input - larger */}
            <input
              type="text"
              placeholder="Enter agent nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-[2]"
            />

            {/* OS Dropdown - smaller */}
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-[1]"
            >
              <option value="">Select OS</option>
              <option value="Windows">Windows</option>
              <option value="macOS">macOS</option>
              <option value="Linux">Linux</option>
            </select>
          </div>

          {/* Generate Agent Button below inputs */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm w-half">
            Generate Agent File
          </button>
        </div>
      </div>

      {/* Registered Agents Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Registered Agents</h3>
          <input
            type="text"
            placeholder="Search agents…"
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>

        <table className="w-full text-sm text-gray-700">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Nickname</th>
              <th className="py-2">Operating System</th>
              <th className="py-2">Date Generated</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 flex items-center gap-2">
                  {agent.icon}
                  {agent.name}
                </td>
                <td className="py-2">{agent.os}</td>
                <td className="py-2">{agent.date}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
                    <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
