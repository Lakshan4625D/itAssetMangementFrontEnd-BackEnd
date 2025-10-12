import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

const severityStyles = {
  High: "bg-[#FEE2E2] text-[#DC2626]",
  Medium: "bg-[#FFEDD5] text-[#F97316]",
  Low: "bg-[#FEF9C3] text-[#FACC15]",
  Clean: "bg-[#DCFCE7] text-[#15803D]",
  Unknown: "bg-[#E5E7EB] text-[#6B7280]",
};

const SoftwareVulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:8000/malware-detections")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch malware detections");
        return res.json();
      })
      .then((data) => {
        setVulnerabilities(data.malware_detections || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Pagination calculations
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = vulnerabilities.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(vulnerabilities.length / rowsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-4">
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Software Vulnerabilities
          </h2>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700">
              Scan for Malwares
            </button>
            <button className="flex items-center gap-2 bg-[#F3F4F6] border border-[#D1D5DB] text-[#374151] px-4 py-2 rounded-md text-sm font-medium">
              <FaDownload className="text-sm" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Device IP</th>
                <th className="px-4 py-3">Hostname</th>
                <th className="px-4 py-3">Software Name</th>
                <th className="px-4 py-3">File Path</th>
                <th className="px-4 py-3">Vulnerability</th>
                <th className="px-4 py-3">Scan Time</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No malware detections found.
                  </td>
                </tr>
              ) : (
                currentRows.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{item.device_ip}</td>
                    <td className="px-4 py-3">{item.hostname}</td>
                    <td className="px-4 py-3">{item.software_name}</td>
                    <td className="px-4 py-3">{item.file_path}</td>
                    <td className="px-4 py-3">{item.vulnerability}</td>
                    <td className="px-4 py-3">{item.scan_time}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                          severityStyles[item.severity] || severityStyles.Unknown
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, vulnerabilities.length)} of{" "}
            {vulnerabilities.length} services
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
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
              onClick={() => setCurrentPage((p) => p + 1)}
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
};

export default SoftwareVulnerabilities;
