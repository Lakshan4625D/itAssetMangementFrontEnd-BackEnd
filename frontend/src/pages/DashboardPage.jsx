import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlay, FaDownload } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RefreshCcw } from "lucide-react";
import { Monitor, Cloud, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    total_devices: 0,
    cloud_assets: 0,
    vulnerabilities: 0,
  });
  const [recentDevices, setRecentDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/dashboard/summary`);
      setSummary(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to load summary data");
    }
  };

  const fetchRecentScan = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/dashboard/recent-scan`);
      setRecentDevices(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching recent scan:", err);
      setError("Failed to load recent scan data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchRecentScan();
  }, []);
  
  const pollScanStatus = () => {
    const interval = setInterval(() => {
      axios.get("http://localhost:8000/network/scan-status")
        .then((res) => {
          const status = res.data.status;
          if (status === "finished" || status === "error") {
            clearInterval(interval);
            setLoadingScan(false);
            fetchRecentScan();
            fetchSummary();
          }
        })
        .catch(() => {
          clearInterval(interval);
          setLoadingScan(false);
        });
    }, 3000);
  };

  // Start scan
  const handleStartScan = () => {
    setLoadingScan(true);
    axios.post("http://localhost:8000/network/start-scan")
      .then(() => {
        pollScanStatus();
      })
      .catch(() => {
        setError("Failed to start scan");
        setLoadingScan(false);
      });
  };

  // 🔽 Export function
  const handleExport = async () => {
    try {
      const response = await axios.get("http://localhost:8000/export/dashboard-overview", {
        responseType: "blob", // important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "dashboard_export.csv"); // filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export devices");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* Page Title and Action Buttons */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Dashboard
          </h1>
          <div className="flex gap-3">
            {/* Start New Scan Button */}
            <button
                onClick={handleStartScan}
                disabled={loadingScan}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm ${
                  loadingScan
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#2563EB] text-white hover:bg-blue-700"
                }`}
              >
                <FaPlay className="text-xs" />
                {loadingScan ? "Scanning..." : "Start New Scan"}
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

        {/* ERROR DISPLAY */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Stats Section */}
        <div className="flex gap-6 mb-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <Monitor className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{summary.total_devices}</p>
            <p className="text-sm text-gray-600">Total Devices</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <Cloud className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{summary.cloud_assets}</p>
            <p className="text-sm text-gray-600">Cloud Assets</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{summary.vulnerabilities}</p>
            <p className="text-sm text-gray-600">Vulnerabilities</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-lg text-gray-800 mb-4 font-bold">
            Most Recent Network Scan
          </h3>
          <div className="flex justify-between items-center mb-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Reload Button */}
            <button
              onClick={() => {
                setLoading(true);
                fetchSummary();
                fetchRecentScan();
              }}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    IP Address
                  </th>
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    Hostname
                  </th>
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    OS
                  </th>
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    Ports
                  </th>
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    MAC Address
                  </th>
                  <th className="p-2 text-left text-gray-600 font-semibold">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDevices.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No recent scans found
                    </td>
                  </tr>
                )}
                {recentDevices.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="p-2 text-gray-800">{d.ip}</td>
                    <td className="p-2 text-gray-800">{d.hostname}</td>
                    <td className="p-2 text-gray-800">{d.os}</td>
                    <td className="p-2 text-gray-800">{d.ports || "-"}</td>
                    <td className="p-2 text-gray-800">{d.mac}</td>
                    <td className="p-2 text-gray-800">{d.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
