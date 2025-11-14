import { useState } from "react";
import { FaPlay, FaDownload } from "react-icons/fa";
import axios from "axios";

export default function FinalAdditionalInfoPage() {
  const [ip, setIp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [systemDetails, setSystemDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      // Step 1: Trigger scan
      const res = await fetch("http://backend:8000/system/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, username, password }),
      });

      if (!res.ok) throw new Error("Failed to start scan");

      // Step 2: Immediately fetch details from DB
      const detailsRes = await fetch(`http://backend:8000/system-details/${ip}`);
      if (!detailsRes.ok) throw new Error("Failed to fetch details from DB");

      const detailsData = await detailsRes.json();
      setSystemDetails(detailsData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔽 Export function
  const handleExport = async () => {
    try {
      const response = await axios.get(`http://backend:8000/export/system-details`, {
        params: {
          ip: ip,        // IP address required by the API
          format: "csv"  // or "json"
        },
        responseType: "blob", // important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "AdditonalInfo_export.csv"); // filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export devices");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold">Additional Info</h1>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-md font-medium text-sm">
            <FaPlay className="text-xs" />
            Start New Scan
          </button>
           {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm"
            >
              <FaDownload className="text-xs" />
              Export
            </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Get System Details</h2>

        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">IP Address</label>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter IP address"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter username"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter password"
            />
          </div>
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 text-sm font-semibold rounded shadow`}
        >
          {loading ? "Scanning..." : "Fetch Additional Info"}
        </button>
      </div>

      {/* Results */}
      {systemDetails && (
        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="font-medium">{systemDetails.ip}</span>
              <span className="text-gray-500">{systemDetails.host_name}</span>
            </div>
            <span className="text-sm text-gray-500">{systemDetails.os}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm text-gray-800">
            <div>
              <h3 className="font-semibold mb-2">System Information</h3>
              <InfoRow label="OS Name" value={systemDetails.os_name} />
              <InfoRow label="OS Version" value={systemDetails.os_version} />
              <InfoRow label="Manufacturer" value={systemDetails.manufacturer} />
              <InfoRow label="Model" value={systemDetails.model} />
              <InfoRow label="System Type" value={systemDetails.system_type} />
              <InfoRow label="BIOS Version" value={systemDetails.bios_version} />

              <h3 className="font-semibold mt-6 mb-2">Network Configuration</h3>
              <InfoRow label="Adapter" value={systemDetails.network_adapter} />
              <InfoRow label="Domain" value={systemDetails.domain} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Memory</h3>
              <InfoRow label="Total Physical" value={systemDetails.total_physical_memory} />
              <InfoRow label="Available Physical" value={systemDetails.available_physical_memory} />
              <InfoRow label="Virtual Memory Max" value={systemDetails.virtual_memory_max} />
              <InfoRow label="Virtual Memory Available" value={systemDetails.virtual_memory_available} />

              <h3 className="font-semibold mt-6 mb-2">System Details</h3>
              <p className="mb-1">Boot Time: <strong>{systemDetails.boot_time}</strong></p>
              <p className="mb-1">Installed Hotfixes:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {systemDetails.hotfixes?.map((kb) => (
                  <span key={kb} className="bg-gray-100 border border-gray-300 text-xs px-2 py-1 rounded-full">
                    {kb}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm">
              <FaDownload className="text-xs" />
              Export Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="mb-1">
      {label}: <strong>{value || "—"}</strong>
    </p>
  );
}
