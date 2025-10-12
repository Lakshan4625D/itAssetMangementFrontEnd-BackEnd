import { CloudIcon, DatabaseIcon, FunnelIcon } from 'lucide-react';
import { FaPlay, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CloudScanHistoryPage() {
  const navigate = useNavigate();

  // --- State ---
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // --- Fetch data from backend ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/cloud-scan-history");
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error("Error fetching scan history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // --- Derived values ---
  const totalEntries = history.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfFirstItem = (currentPage - 1) * entriesPerPage;
  const indexOfLastItem = indexOfFirstItem + entriesPerPage;
  const currentEntries = history.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Cloud Scan History
      </h2>

      {/* Action Buttons */}
      <div className="mb-6">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: <CloudIcon className="w-6 h-6 text-blue-500" />,
            title: "Total Scans",
            value: totalEntries,
          },
          {
            icon: <DatabaseIcon className="w-6 h-6 text-green-500" />,
            title: "Active Providers",
            value: new Set(history.map((h) => h.provider)).size,
          },
          {
            icon: <DatabaseIcon className="w-6 h-6 text-indigo-500" />,
            title: "Total VMs Scanned",
            value: history.reduce((sum, h) => sum + (h.vms || 0), 0),
          },
          {
            icon: <DatabaseIcon className="w-6 h-6 text-pink-500" />,
            title: "Total Storage Units",
            value: history.reduce((sum, h) => sum + (h.buckets || 0), 0),
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
          >
            <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-lg font-semibold text-gray-800">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search scans..."
          className="w-full sm:w-1/2 border border-gray-300 rounded-md px-4 py-2 text-sm"
        />
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Last updated: 5 mins ago</span>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last Month</option>
          </select>
          <button className="flex items-center gap-1 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100">
            <FunnelIcon className="w-4 h-4 text-gray-600" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <p className="p-4 text-gray-500">Loading scan history...</p>
        ) : (
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Scan ID</th>
                <th className="px-6 py-3 font-medium">Provider</th>
                <th className="px-6 py-3 font-medium">Scan Time</th>
                <th className="px-6 py-3 font-medium">No. of VMs</th>
                <th className="px-6 py-3 font-medium">Buckets</th>
                <th className="px-6 py-3 font-medium">Clusters</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentEntries.map((row) => (
                <tr key={row.scan_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">
                    #{row.scan_id}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <CloudIcon className="w-4 h-4 text-gray-500" />
                    {row.provider.toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(row.scan_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{row.vms}</td>
                  <td className="px-6 py-4">{row.buckets}</td>
                  <td className="px-6 py-4">{row.clusters}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => navigate(`/scan-info/${row.scan_id}`)}
                    >
                      View Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t text-sm text-gray-600">
          <span className="mb-2 sm:mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-md bg-[#2563EB] text-white font-medium">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
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
