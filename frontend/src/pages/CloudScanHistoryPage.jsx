import { CloudIcon, DatabaseIcon, FunnelIcon } from 'lucide-react';
import { FaPlay, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CloudScanHistoryPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 21; // Adjust based on total scans
  const entriesPerPage = 5;
  const totalEntries = 105;

  const indexOfFirstItem = (currentPage - 1) * entriesPerPage;
  const indexOfLastItem = indexOfFirstItem + entriesPerPage;

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      {/* Page Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Cloud Scan History</h2>

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
          { icon: <CloudIcon className="w-6 h-6 text-blue-500" />, title: 'Total Scans', value: 105 },
          { icon: <DatabaseIcon className="w-6 h-6 text-green-500" />, title: 'Active Providers', value: 3 },
          { icon: <DatabaseIcon className="w-6 h-6 text-indigo-500" />, title: 'Total VMs Scanned', value: 14 },
          { icon: <DatabaseIcon className="w-6 h-6 text-pink-500" />, title: 'Total Storage Units', value: 9 },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-lg font-semibold text-gray-800">{card.value}</p>
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
            {[
              { id: 105, provider: 'AWS', time: '2025-07-12 10:32 AM', vms: 5, buckets: 3, clusters: 2 },
              { id: 104, provider: 'Azure', time: '2025-07-10 09:00 AM', vms: 2, buckets: 1, clusters: 0 },
              { id: 103, provider: 'GCP', time: '2025-07-08 03:22 PM', vms: 3, buckets: 2, clusters: 1 },
              { id: 102, provider: 'AWS', time: '2025-07-05 11:10 AM', vms: 1, buckets: 0, clusters: 0 },
              { id: 101, provider: 'Azure', time: '2025-07-03 08:45 AM', vms: 4, buckets: 2, clusters: 1 },
            ].map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">#{row.id}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <CloudIcon className="w-4 h-4 text-gray-500" />
                  {row.provider}
                </td>
                <td className="px-6 py-4">{row.time}</td>
                <td className="px-6 py-4">{row.vms}</td>
                <td className="px-6 py-4">{row.buckets}</td>
                <td className="px-6 py-4">{row.clusters}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => navigate('/scan-info')}
                  >
                    View Info
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Single Moving Page Number Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t text-sm text-gray-600">
          <span className="mb-2 sm:mb-0">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
