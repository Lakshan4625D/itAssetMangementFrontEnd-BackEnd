import { useState } from 'react';
import {
  ListIcon,
  GridIcon,
  CheckCircle2Icon,
  XCircleIcon
} from 'lucide-react';
import { FaPlay, FaDownload } from 'react-icons/fa';

// Import cloud provider logos
import awsLogo from '../assets/aws-logo.svg';
import azureLogo from '../assets/azure-logo.svg';
import gcpLogo from '../assets/gcp-logo.svg';

const tabs = ['EC2 / VMs', 'Storage', 'IAM Users'];

export default function FinalCloudAssetPage() {
  const [activeTab, setActiveTab] = useState('EC2 / VMs');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const tableData = [...Array(22)].map((_, idx) => ({
    instance: `EC2-${1000 + idx}`,
    ip: `192.168.0.${10 + idx}`,
    status: true,
    encrypted: idx % 2 === 0,
    owner: 'admin@cloud'
  }));

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen overflow-auto">
      {/* Top Section */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h1>

      {/* Start New Scan + Export */}
      <div className="flex justify-between items-center mb-6">
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
        <div className="flex gap-2">
          <GridIcon className="w-5 h-5 text-gray-600 cursor-pointer" />
          <ListIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
        </div>
      </div>

      {/* Cloud Provider Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* AWS */}
        <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <img src={awsLogo} alt="AWS Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm text-gray-500">AWS</p>
            <p className="text-lg font-semibold text-gray-800">19 Resources</p>
          </div>
        </div>

        {/* Azure */}
        <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <img src={azureLogo} alt="Azure Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm text-gray-500">Azure</p>
            <p className="text-lg font-semibold text-gray-800">15 Resources</p>
          </div>
        </div>

        {/* GCP */}
        <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm">
          <img src={gcpLogo} alt="GCP Logo" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm text-gray-500">GCP</p>
            <p className="text-lg font-semibold text-gray-800">22 Resources</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Instance</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Encrypted</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{item.instance}</td>
                <td className="px-6 py-4">{item.ip}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2Icon className="w-4 h-4" />
                    Yes
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.encrypted ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2Icon className="w-4 h-4" />
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircleIcon className="w-4 h-4" />
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{item.owner}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, tableData.length)} of {tableData.length} entries
          </span>
          <div className="flex gap-2">
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
