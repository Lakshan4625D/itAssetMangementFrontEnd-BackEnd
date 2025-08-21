import React, { useState } from "react";
import { FaNetworkWired, FaUser, FaLock, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

export default function InstalledSoftwarePage() {
  const [ip, setIp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const fetchSoftware = async () => {
    try {
      const res = await axios.post("http://localhost:8000/system/scan", {
        ip,
        username,
        password,
      });
      setData(res.data);
      setError(null);
      setCurrentPage(1); // reset pagination when new scan runs
    } catch (err) {
      console.error(err);
      setError("Failed to fetch software info");
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentApps = data ? data.applications.slice(indexOfFirst, indexOfLast) : [];
  const totalPages = data ? Math.ceil(data.applications.length / entriesPerPage) : 1;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Fetch Installed Software Card */}
      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-gray-800">
          Fetch Installed Software
        </h2>

        {/* Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaNetworkWired />
            </span>
            <input
              type="text"
              placeholder="Enter IP address"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaUser />
            </span>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input type="checkbox" className="form-checkbox text-blue-600 mr-2" />
            Also perform ClamAV malware scan
          </label>

          <button
            onClick={fetchSoftware}
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 w-fit"
          >
            Get Software Info
          </button>
        </div>
      </div>

      {/* Software Info Section */}
      {data && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-lg font-semibold text-gray-800">{data.ip}</div>
              <div className="text-sm text-gray-500">{data.os}</div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {data.lastUpdated || "Unknown"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-800">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Version</th>
                  <th className="px-4 py-3 font-semibold text-gray-800">Publisher</th>
                </tr>
              </thead>
              <tbody>
                {currentApps.map((app, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{app.name}</td>
                    <td className="px-4 py-3 text-gray-800">{app.version}</td>
                    <td className="px-4 py-3 text-gray-800">{app.publisher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls (same style as FinalDevicesPage) */}
          <div className="flex justify-between items-center mt-10 text-sm text-gray-500">
            <div>
              Showing {indexOfFirst + 1} to{" "}
              {indexOfLast > data.applications.length
                ? data.applications.length
                : indexOfLast}{" "}
              of {data.applications.length} entries
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-[#2563EB] text-white font-medium">
                {currentPage}
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Malware Scan Result */}
          <div className="flex items-center text-green-600 text-sm gap-2 pt-3 pl-2">
            <FaCheckCircle />
            <span>Malware Scan Result: {data.malwareScan}</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
