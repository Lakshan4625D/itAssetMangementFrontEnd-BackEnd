import React from "react";
import { FaPlay, FaDownload } from "react-icons/fa";
import { Search, RefreshCcw } from "lucide-react";
import { Monitor, Cloud, AlertTriangle } from "lucide-react";


const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* Page Title and Action Buttons */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Scan History
          </h1>
          <div className="flex gap-3">
            {/* Start New Scan Button */}
            <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-md font-medium text-sm">
              <FaPlay className="text-xs" />
              Start New Scan
            </button>

            {/* Export Button */}
            <button className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm">
              <FaDownload className="text-xs" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-6 mb-5">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <Monitor className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-600">Total Devices</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <Cloud className="w-6 h-6 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">5</p>
            <p className="text-sm text-gray-600">Cloud Assets</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 text-left w-1/3 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">3</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Reload Button */}
            <button className="text-gray-600 hover:text-blue-600 focus:outline-none">
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
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-gray-800">192.168.1.10</td>
                  <td className="p-2 text-gray-800">device1</td>
                  <td className="p-2 text-gray-800">Linux</td>
                  <td className="p-2 text-gray-800">22</td>
                  <td className="p-2 text-gray-800">00:1A:2B:3C:4D:5F</td>
                  <td className="p-2 text-gray-800">Server</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-gray-800">192.168.1.15</td>
                  <td className="p-2 text-gray-800">device2</td>
                  <td className="p-2 text-gray-800">Windows</td>
                  <td className="p-2 text-gray-800">80, 443</td>
                  <td className="p-2 text-gray-800">00:1A:2B:3C:4D:5F</td>
                  <td className="p-2 text-gray-800">Workstation</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-gray-800">192.168.1.20</td>
                  <td className="p-2 text-gray-800">device3</td>
                  <td className="p-2 text-gray-800">Linux</td>
                  <td className="p-2 text-gray-800">3389</td>
                  <td className="p-2 text-gray-800">00:1A:2B:3C:4D:60</td>
                  <td className="p-2 text-gray-800">Workstation</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 text-gray-800">192.168.1.25</td>
                  <td className="p-2 text-gray-800">device4</td>
                  <td className="p-2 text-gray-800">Linux</td>
                  <td className="p-2 text-gray-800">-</td>
                  <td className="p-2 text-gray-800">00:1A:2B:3C:4D:61</td>
                  <td className="p-2 text-gray-800">Server</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
