import {
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { FaWindows, FaLinux, FaApple } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

export default function GenerateAgentPage() {
  const [nickname, setNickname] = useState("");
  const [os, setOs] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Map frontend OS values -> backend OS values
  const osMap = {
    Windows: "windows",
    Linux: "linux",
    macOS: "darwin",
  };

  // Fetch agents from backend
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get("http://backend:8000/agents/fetchall");
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleGenerate = async () => {
    if (!nickname || !os) {
      alert("⚠️ Please enter nickname and select OS");
      return;
    }

    const backendOs = osMap[os];
    setLoading(true);

    try {
      const response = await axios.post(
        "http://backend:8000/agents/build",
        null,
        {
          params: { nickname, os: backendOs },
          responseType: "blob",
        }
      );

      // Download agent file
      const blob = new Blob([response.data], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${nickname}_${backendOs}${backendOs === "windows" ? ".exe" : ""}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`✅ Agent ${nickname}_${backendOs} generated successfully`);

      // Refresh agent list
      fetchAgents();
    } catch (error) {
      console.error("Download error:", error);
      let message = "Failed to generate agent";
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            alert(`❌ Error: ${data.detail || message}`);
          } catch {
            alert(`❌ Error: ${reader.result || message}`);
          }
        };
        reader.readAsText(error.response.data);
      } else {
        alert(`❌ Error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    try {
      await axios.delete(`http://backend:8000/agents/${id}`);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      alert("✅ Agent deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete agent");
    }
  };

  // Pick OS icon
  const getOsIcon = (os) => {
    if (os === "windows") return <FaWindows className="w-5 h-5 text-blue-600" />;
    if (os === "linux") return <FaLinux className="w-5 h-5 text-green-600" />;
    if (os === "darwin") return <FaApple className="w-5 h-5 text-gray-800" />;
    return <MoreHorizontal className="w-5 h-5 text-gray-400" />;
  };

  // Filter agents by search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.os.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-white overflow-y-auto h-full">
      {/* Page Title */}
      <h2 className="text-gray-600 text-lg font-medium">Generate Agent</h2>

      {/* Generate Agent Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 border border-gray-100">
        <div className="w-full md:w-[65%] space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter agent nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-[2]"
            />
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-[1]"
            >
              <option value="Windows">Windows</option>
              <option value="macOS">macOS</option>
              <option value="Linux">Linux</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-4 py-2 rounded text-sm w-half`}
          >
            {loading ? "Building..." : "Generate Agent File"}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <tr key={agent.id} className="border-b">
                  <td className="py-2 flex items-center gap-2">
                    {getOsIcon(agent.os)}
                    {agent.nickname}
                  </td>
                  <td className="py-2">{agent.os}</td>
                  <td className="py-2">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Trash2
                        className="w-4 h-4 text-red-500 cursor-pointer"
                        onClick={() => handleDelete(agent.id)}
                      />
                      <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  No agents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
