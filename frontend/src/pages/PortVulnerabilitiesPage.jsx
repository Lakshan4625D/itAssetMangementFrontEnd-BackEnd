import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaShieldAlt, FaDownload, FaTh } from "react-icons/fa";

// Keep the exact remembered severity colors
const severityStyles = {
  Critical: "bg-[#FEE2E2] text-[#DC2626]",
  High: "bg-[#FEE2E2] text-[#DC2626]",
  Medium: "bg-[#FFEDD5] text-[#FACC15]",
};

const vulnerabilities = [
  { ip: "192.168.1.1", hostname: "Server01", port: "80", protocol: "TCP", cve: "CVE-2018-5173", description: "OpenSSL User Enumeration", severity: "Critical" },
  { ip: "192.168.1.2", hostname: "WebApp07", port: "443", protocol: "TCP", cve: "CVE-2016-1231", description: "HTTP Privilege Esc", severity: "High" },
  { ip: "192.168.1.3", hostname: "DBServer", port: "3306", protocol: "TCP", cve: "CVE-2020-9871", description: "Buffer Overflow", severity: "High" },
  { ip: "192.168.1.4", hostname: "AppServer", port: "1433", protocol: "TCP", cve: "CVE-2019-1214", description: "Remote Code Execution", severity: "High" },
  { ip: "192.168.1.5", hostname: "MailServer", port: "25", protocol: "TCP", cve: "CVE-2022-1348", description: "Hazard Injection", severity: "Medium" },
  { ip: "192.168.1.6", hostname: "FileServer", port: "21", protocol: "TCP", cve: "CVE-2017-4567", description: "FTP Overflow", severity: "Medium" },
  { ip: "192.168.1.7", hostname: "Gateway", port: "8080", protocol: "TCP", cve: "CVE-2021-3344", description: "Proxy Bypass", severity: "Critical" },
];

export default function PortVulnerabilitiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = vulnerabilities.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(vulnerabilities.length / itemsPerPage);

  return (
    <div className="bg-[#F9FAFB] p-6 min-h-screen font-sans text-[#1F2937]">
      <div className="bg-white rounded-xl p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-xl font-semibold">Port Vulnerabilities</h1>
            <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#1E4DB7] transition">
              <FaShieldAlt className="text-sm" />
              Scan for Vulnerabilities
            </button>
            <button className="flex items-center gap-2 bg-[#F3F4F6] border border-[#D1D5DB] text-[#374151] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition">
              <FaDownload className="text-sm" />
              Export
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <select className="border border-[#D1D5DB] text-gray-600 text-sm rounded-md px-3 py-2 bg-white">
              <option>All Severities</option>
            </select>
            <select className="border border-[#D1D5DB] text-gray-600 text-sm rounded-md px-3 py-2 bg-white">
              <option>All Ports</option>
            </select>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vulnerabilities..."
                className="pl-9 pr-3 py-2 w-56 border border-[#E5E7EB] rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Grid/List toggle */}
            <button className="p-2 rounded-md hover:bg-gray-100">
              <FaTh className="text-gray-600 text-sm" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6B7280] text-sm font-semibold border-b border-gray-200">
                <th className="text-left py-3 pr-6">Device IP</th>
                <th className="text-left py-3 pr-6">Hostname</th>
                <th className="text-left py-3 pr-6">Port</th>
                <th className="text-left py-3 pr-6">Protocol</th>
                <th className="text-left py-3 pr-6">Vulnerability ID</th>
                <th className="text-left py-3 pr-6">Description</th>
                <th className="text-left py-3 pr-6">Severity</th>
                <th className="text-left py-3">Action</th>
              </tr>
            </thead>
            <tbody>
            {currentItems.map((vuln, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100">
                <td className="py-4 pr-6">{vuln.ip}</td>
                <td className="py-4 pr-6">{vuln.hostname}</td>
                <td className="py-4 pr-6">{vuln.port}</td>
                <td className="py-4 pr-6">{vuln.protocol}</td>
                <td className="py-4 pr-6">{vuln.cve}</td>
                <td className="py-4 pr-6">{vuln.description}</td>
                <td className="py-4 pr-6">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${severityStyles[vuln.severity]}`}
                  >
                    {vuln.severity}
                  </span>
                </td>
                <td className="py-4 pr-3">
                  <button className="text-[#2563EB] font-medium text-sm hover:underline">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, vulnerabilities.length)} of {vulnerabilities.length} services
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border transition ${
                currentPage === 1
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-md bg-[#2563EB] text-white font-semibold">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border transition ${
                currentPage === totalPages
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
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
