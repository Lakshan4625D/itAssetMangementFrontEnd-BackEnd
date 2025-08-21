import { useState, useEffect } from "react";
import { FaPlay, FaDownload, FaTh } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RxDotFilled } from "react-icons/rx";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const statusColors = {
  online: "text-green-500",
  offline: "text-red-500",
  warning: "text-yellow-500",
  Active: "text-green-500", // matches backend
};

export default function FinalDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const entriesPerPage = 5;

  // Fetch devices from backend
  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/devices-table");

      // Flatten devices while keeping subnet + lastScan info
      const flatDevices = res.data.flatMap((subnetGroup) =>
        subnetGroup.devices.map((device) => ({
          ...device,
          subnet: subnetGroup.subnet,
          lastScan: subnetGroup.lastScan,
        }))
      );

      // Deduplicate by IP
      const uniqueDevices = Array.from(
        new Map(flatDevices.map((d) => [d.ip, d])).values()
      );

      // Sort by subnet first, then IP
      uniqueDevices.sort((a, b) => {
        if (a.subnet < b.subnet) return -1;
        if (a.subnet > b.subnet) return 1;
        return a.ip.localeCompare(b.ip, undefined, { numeric: true });
      });

      setDevices(uniqueDevices);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      setError("Could not load devices");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentDevices = devices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(devices.length / entriesPerPage);

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
    <div className="bg-[#F7F8FA] min-h-screen p-6 font-inter text-[#1F2937]">
      <div className="bg-white rounded-xl p-6">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold mb-2">Devices</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-md font-medium text-sm">
                <FaPlay className="text-xs" />
                Start New Scan
              </button>
              <button className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm">
                <FaDownload className="text-xs" />
                Export
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search assets..."
                className="pl-9 pr-3 py-2 w-52 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-sm focus:outline-none"
              />
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <FaTh className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Devices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#6B7280]">
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-6"></th>
                <th className="py-3 pr-6">IP Address</th>
                <th className="py-3 pr-6">Hostname</th>
                <th className="py-3 pr-6">MAC Address</th>
                <th className="py-3 pr-6">Device Type</th>
                <th className="py-3 pr-6">OS</th>
                <th className="py-3 pr-6">Status</th>
                <th className="py-3 pr-6">Last Seen</th>
                <th className="py-3 pr-6">Subnet</th>
                <th className="py-3 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {currentDevices.map((device, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  <td className="py-4 pr-6">
                    <input type="checkbox" />
                  </td>
                  <td className="py-4 pr-6">{device.ip}</td>
                  <td className="py-4 pr-6">{device.hostname}</td>
                  <td className="py-4 pr-6">{device.mac}</td>
                  <td className="py-4 pr-6">{device.type}</td>
                  <td className="py-4 pr-6">{device.os}</td>
                  <td className="py-4 pr-6 flex items-center gap-1">
                    <RxDotFilled
                      className={`text-lg ${
                        statusColors[device.status] || "text-gray-400"
                      }`}
                    />
                    {device.status}
                  </td>
                  <td className="py-4 pr-6">{device.lastSeen}</td>
                  <td className="py-4 pr-6">{device.subnet}</td>
                  <td className="py-4 pr-2">
                    <BsThreeDotsVertical className="text-gray-500 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-10 text-sm text-gray-500">
          <div>
            Showing {indexOfFirst + 1} to{" "}
            {indexOfLast > devices.length ? devices.length : indexOfLast} of{" "}
            {devices.length} entries
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
      </div>
    </div>
  );
}
