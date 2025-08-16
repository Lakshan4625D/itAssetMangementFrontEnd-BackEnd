import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaShieldAlt, FaDownload, FaTh } from "react-icons/fa";
import { BsDot } from "react-icons/bs";

const severityStyles = {
  Critical: "bg-[#FEE2E2] text-[#DC2626]",
  High: "bg-[#FFEDD5] text-[#F97316]",
  Medium: "bg-[#FEF9C3] text-[#FACC15]",
};

const SoftwareVulnerabilities = () => {
  return (
    <div className="bg-gray-100 min-h-screen px-6 py-4">
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Software Vulnerabilities</h2>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700">
              Scan for Malwares
            </button>
            <button className="flex items-center gap-2 bg-[#F3F4F6] border border-[#D1D5DB] text-[#374151] px-4 py-2 rounded-md text-sm font-medium">
              <FaDownload className="text-sm" />Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select className="border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 bg-white shadow-sm">
            <option>Filter by Severity</option>
          </select>
          <select className="border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 bg-white shadow-sm">
            <option>Filter by Device</option>
          </select>
          <select className="border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 bg-white shadow-sm">
            <option>Filter by Software</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Device IP</th>
                <th className="px-4 py-3">Hostname</th>
                <th className="px-4 py-3">Software Name</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">File Path</th>
                <th className="px-4 py-3">Vulnerability</th>
                <th className="px-4 py-3">Scan Time</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  ip: '192.168.0.1',
                  host: 'Server01',
                  software: 'Anydesk',
                  version: '7.0.3',
                  path: 'C:\\Program Files\\AnyDesk\\AnyDesk.exe',
                  vuln: 'Win.Trojan.Zeus',
                  time: '2025-08-05',
                  severity: 'High',
                  badge: 'bg-red-100 text-red-700',
                },
                {
                  ip: '192.168.0.2',
                  host: 'ClientPC',
                  software: 'Adobe',
                  version: '10.1.3',
                  path: 'C:\\Program Files\\Adobe\\Acrobat.exe',
                  vuln: 'Win.Virus.Zeus',
                  time: '2025-08-05',
                  severity: 'Medium',
                  badge: 'bg-orange-100 text-orange-700',
                },
                {
                  ip: '192.168.0.3',
                  host: 'ClientPC',
                  software: 'Adobe',
                  version: '10.1.3',
                  path: 'C:\\Program Files\\Adobe\\Acrobat.exe',
                  vuln: 'Win.Trojan.Generic',
                  time: '2025-08-05',
                  severity: 'Low',
                  badge: 'bg-yellow-100 text-yellow-700',
                },
                {
                  ip: '192.168.0.4',
                  host: 'ClientPC',
                  software: 'Adobe',
                  version: '10.1.3',
                  path: 'C:\\Program Files\\Adobe\\Acrobat.exe',
                  vuln: 'Win.Trojan.Generic',
                  time: '2025-08-05',
                  severity: 'Clean',
                  badge: 'bg-green-100 text-green-700',
                },
                {
                  ip: '192.168.0.5',
                  host: 'ClientPC',
                  software: 'Adobe',
                  version: '10.1.3',
                  path: 'C:\\Program Files\\Adobe\\Acrobat.exe',
                  vuln: 'Win.Trojan.Generic',
                  time: '2025-08-05',
                  severity: 'Unknown',
                  badge: 'bg-gray-100 text-gray-700',
                },
              ].map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{item.ip}</td>
                  <td className="px-4 py-3">{item.host}</td>
                  <td className="px-4 py-3">{item.software}</td>
                  <td className="px-4 py-3">{item.version}</td>
                  <td className="px-4 py-3">{item.path}</td>
                  <td className="px-4 py-3">{item.vuln}</td>
                  <td className="px-4 py-3">{item.time}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${item.badge}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-blue-600 hover:underline text-sm cursor-pointer">
                      Details
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">Showing 1 to 5 of 5 entries</span>
          <div className="flex gap-2">
            <button className="bg-gray-100 text-gray-400 px-3 py-1 rounded-md cursor-not-allowed">
              Previous
            </button>
            <button className="bg-blue-600 text-white px-3 py-1 rounded-md">1</button>
            <button className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwareVulnerabilities;
