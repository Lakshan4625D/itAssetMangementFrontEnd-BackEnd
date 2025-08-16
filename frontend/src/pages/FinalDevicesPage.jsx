import { useState } from "react";
import { FaPlay, FaDownload, FaTh } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RxDotFilled } from "react-icons/rx";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoClose } from "react-icons/io5";

const statusColors = {
  online: "text-green-500",
  offline: "text-red-500",
  warning: "text-yellow-500",
};

const devices = [
  {
    ip: "192.168.1.100",
    hostname: "DESKTOP-ABC123",
    mac: "00:1B:44:11:3A:B7",
    type: "🖥️ Desktop",
    os: "Windows 10 Pro",
    status: "online",
    lastSeen: "2024-01-20 14:30",
  },
  {
    ip: "192.168.1.101",
    hostname: "LAPTOP-XYZ789",
    mac: "00:24:E8:11:3A:B8",
    type: "💻 Laptop",
    os: "macOS Big Sur",
    status: "offline",
    lastSeen: "2024-01-20 12:15",
  },
  {
    ip: "192.168.1.102",
    hostname: "SRV-DB01",
    mac: "00:1B:44:11:3A:B9",
    type: "🖧 Server",
    os: "Ubuntu Server",
    status: "online",
    lastSeen: "2024-01-20 14:45",
  },
  {
    ip: "192.168.1.103",
    hostname: "LAPTOP-DEF456",
    mac: "00:24:E8:11:3A:BA",
    type: "💻 Laptop",
    os: "Windows 11",
    status: "warning",
    lastSeen: "2024-01-20 13:20",
  },
  {
    ip: "192.168.1.104",
    hostname: "TABLET-123",
    mac: "00:1B:44:11:3A:BB",
    type: "📱 Tablet",
    os: "iOS 16",
    status: "online",
    lastSeen: "2024-01-20 14:50",
  },
  {
    ip: "192.168.1.105",
    hostname: "PRINTER-001",
    mac: "00:1B:44:11:3A:BC",
    type: "🖨️ Printer",
    os: "Embedded OS",
    status: "offline",
    lastSeen: "2024-01-20 11:00",
  },
];

export default function FinalDevicesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 4;

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
        {/* Title & Actions Row */}
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

          {/* Right-side Search & Filters */}
          <div className="flex items-center gap-3">
            {/* Tags */}
            <div className="flex items-center gap-2">
              {["Windows", "Online"].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center text-sm bg-[#E0E7FF] text-[#1E3A8A] px-3 py-1 rounded-full"
                >
                  {tag}
                  <IoClose className="ml-1 text-base cursor-pointer" />
                </span>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search assets..."
                className="pl-9 pr-3 py-2 w-52 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-sm focus:outline-none"
              />
            </div>

            {/* Grid toggle */}
            <button className="p-2 rounded-md hover:bg-gray-100">
              <FaTh className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#6B7280]">
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-6">
                  <input type="checkbox" />
                </th>
                <th className="py-3 pr-6">IP Address</th>
                <th className="py-3 pr-6">Hostname</th>
                <th className="py-3 pr-6">MAC Address</th>
                <th className="py-3 pr-6">Device Type</th>
                <th className="py-3 pr-6">OS</th>
                <th className="py-3 pr-6">Status</th>
                <th className="py-3 pr-6">Last Seen</th>
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
                      className={`text-lg ${statusColors[device.status]}`}
                    />
                    {device.status}
                  </td>
                  <td className="py-4 pr-6">{device.lastSeen}</td>
                  <td className="py-4 pr-2">
                    <BsThreeDotsVertical className="text-gray-500 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
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
