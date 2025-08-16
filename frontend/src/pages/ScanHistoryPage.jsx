import React, { useEffect, useState } from "react";
import { FaSearch, FaPlay, FaDownload } from "react-icons/fa";
import axios from "axios";

const ScanHistoryPage = () => {
  const [subnets, setSubnets] = useState([]);
  const [error, setError] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);

  // Fetch scan history
 const fetchScanHistory = () => {
  axios.get("http://localhost:8000/scan-history")
    .then((res) => {
      // Sort by lastScan (most recent first)
      const sorted = [...res.data].sort((a, b) => {
        const dateA = new Date(a.lastScan);
        const dateB = new Date(b.lastScan);
        return dateB - dateA; // descending
      });
      setSubnets(sorted);
      setError(null);
    })
    .catch(() => {
      setError("Failed to load scan history");
    });
};

  // Poll scan status until finished
  const pollScanStatus = () => {
    const interval = setInterval(() => {
      axios.get("http://localhost:8000/network/scan-status")
        .then((res) => {
          const status = res.data.status;
          if (status === "finished" || status === "error") {
            clearInterval(interval);
            setLoadingScan(false);
            fetchScanHistory(); // Refresh after scan finishes
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

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium inline-block";
    switch (status) {
      case "Active":
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Active</span>;
      case "Inactive":
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Inactive</span>;
      case "Unknown":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Unknown</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium text-gray-700">Scan History</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search devices…"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none"
          />
          <button className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleStartScan}
          disabled={loadingScan}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm ${
            loadingScan
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-[#2563EB] text-white hover:bg-blue-700"
          }`}
        >
          <FaPlay className="text-xs" /> {loadingScan ? "Scanning..." : "Start New Scan"}
        </button>
        <button className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm">
          <FaDownload className="text-xs" /> Export
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {subnets.length === 0 && !error ? (
        <p>No scan history available.</p>
      ) : (
        subnets.map((subnet, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm mb-8 p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">{subnet.subnet}</h2>
                <p className="text-sm text-gray-500">
                  Last scan: {subnet.lastScan} • {subnet.devices.length} devices
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3"></th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Hostname</th>
                    <th className="px-4 py-3">OS</th>
                    <th className="px-4 py-3">MAC Address</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subnet.devices.map((device, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3">{device.ip}</td>
                      <td className="px-4 py-3">{device.hostname}</td>
                      <td className="px-4 py-3">{device.os}</td>
                      <td className="px-4 py-3">{device.mac}</td>
                      <td className="px-4 py-3">{device.type}</td>
                      <td className="px-4 py-3">{getStatusBadge(device.status)}</td>
                      <td className="px-4 py-3">{device.lastSeen}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:underline font-medium text-sm">
                          Check Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ScanHistoryPage;
