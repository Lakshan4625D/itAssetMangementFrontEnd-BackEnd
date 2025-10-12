import { useState, useEffect } from "react";
import { ListIcon, GridIcon } from "lucide-react";
import { FaPlay, FaDownload } from "react-icons/fa";

import awsLogo from "../assets/aws-logo.svg";
import azureLogo from "../assets/azure-logo.svg";
import gcpLogo from "../assets/gcp-logo.svg";

const tabs = ["EC2 / VMs", "Storage", "IAM Users"];
const providers = [
  { key: "aws", label: "AWS", logo: awsLogo },
  { key: "azure", label: "Azure", logo: azureLogo },
  { key: "gcp", label: "GCP", logo: gcpLogo },
];

// Map tab → backend keys
const resourceTypeMap = {
  aws: {
    "EC2 / VMs": ["aws_ec2"],
    Storage: ["aws_s3", "aws_ecs"],
    "IAM Users": ["aws_iam_users"],
  },
  azure: {
    "EC2 / VMs": ["azure_vms"],
    Storage: ["azure_storage_accounts"],
    "IAM Users": ["azure_iam_users"],
  },
  gcp: {
    "EC2 / VMs": ["gcp_vms", "gcp_gke_clusters"],
    Storage: ["gcp_buckets"],
    "IAM Users": ["gcp_iam_users"],
  },
};

export default function FinalCloudAssetPage() {
  const [activeTab, setActiveTab] = useState("EC2 / VMs");
  const [activeProvider, setActiveProvider] = useState("aws");
  const [currentPage, setCurrentPage] = useState(1);
  const [summary, setSummary] = useState({ aws: 0, azure: 0, gcp: 0 });
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  // Fetch summary counts once
  useEffect(() => {
    fetch("http://localhost:8000/cloud-assets/summary")
      .then((res) => res.json())
      .then((data) =>
        setSummary({
          aws: data.aws || 0,
          azure: data.azure || 0,
          gcp: data.gcp || 0,
        })
      )
      .catch((err) => console.error("Error fetching cloud summary:", err));
  }, []);

  // Fetch provider details from new backend
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/cloud/${activeProvider}/latest`
        );
        const data = await res.json();
        setTableData(data);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching cloud assets:", err);
        setTableData({});
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, [activeProvider]);

  // Flatten data for the current tab
  const selectedKeys = resourceTypeMap[activeProvider][activeTab] || [];
  const filteredData = selectedKeys.flatMap((key) => tableData[key] || []);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Column headers
  const headers =
    currentItems.length > 0 ? Object.keys(currentItems[0]) : ["No data"];

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen overflow-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Cloud Assets Dashboard
      </h1>

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

      {/* Provider Switch */}
      <div className="flex gap-6 mb-8">
        {providers.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveProvider(p.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm border transition ${
              activeProvider === p.key
                ? "bg-blue-50 border-blue-500"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <img
              src={p.logo}
              alt={`${p.label} Logo`}
              className="w-8 h-8 object-contain"
            />
            <div className="text-left">
              <p className="text-sm text-gray-500">{p.label}</p>
              <p className="text-lg font-semibold text-gray-800">
                {summary[p.key]} Resources
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-blue-600 font-medium">
            Loading {activeProvider.toUpperCase()} {activeTab}...
          </div>
        ) : (
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {headers.map((col, cidx) => (
                    <td key={cidx} className="px-6 py-4">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available for {activeProvider.toUpperCase()}{" "}
                    {activeTab}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600">
            <span>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} entries
            </span>
            <div className="flex gap-2">
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
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
