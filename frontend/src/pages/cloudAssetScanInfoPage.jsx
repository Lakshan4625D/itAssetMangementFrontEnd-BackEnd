import React, { useState } from "react";
import { FaServer, FaCloud, FaNetworkWired, FaUser, FaChevronDown, FaChevronUp } from "react-icons/fa";

const cloudAssetScanInfoPage = () => {
  const [vmOpen, setVmOpen] = useState(true);
  const [bucketOpen, setBucketOpen] = useState(false);
  const [clusterOpen, setClusterOpen] = useState(false);
  const [iamOpen, setIamOpen] = useState(false);

  return (
    <div className="p-6 mb-8 text-sm font-inter bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">Cloud Scan History / Scan Information</h1>

        {/* Scan Summary */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">Provider:</p>
              <p className="text-sm text-gray-500">Amazon Web Services</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Status:</p>
              <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full">
                Completed
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-700">Scan Date & Time:</p>
              <p className="text-sm text-gray-500">June 15, 2023, 14:30 UTC</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Duration:</p>
              <p className="text-sm text-gray-500">5m 32s</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 hover:shadow transition">
            <FaServer className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">156 VMs</div>
            <div className="text-sm text-gray-500">Virtual Machines</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:shadow transition">
            <FaCloud className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">43 Buckets</div>
            <div className="text-sm text-gray-500">Storage Buckets</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:shadow transition">
            <FaNetworkWired className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">12 Clusters</div>
            <div className="text-sm text-gray-500">Kubernetes Clusters</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 hover:shadow transition">
            <FaUser className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">89 IAM Users</div>
            <div className="text-sm text-gray-500">Identity Access</div>
          </div>
        </div>

        {/* VMs Section */}
        <div className="border rounded-lg overflow-hidden">
          <div
            onClick={() => setVmOpen(!vmOpen)}
            className="bg-gray-100 px-4 py-2 flex justify-between items-center cursor-pointer"
          >
            <span className="font-semibold text-gray-700">Virtual Machines (156)</span>
            {vmOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {vmOpen && (
            <div className="overflow-x-auto transition-all duration-300 ease-in-out">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Instance ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Region</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">i-abc123</td>
                    <td className="px-4 py-2">vm-app-1</td>
                    <td className="px-4 py-2">t2.medium</td>
                    <td className="px-4 py-2">us-west-1</td>
                    <td className="px-4 py-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Running</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">i-def456</td>
                    <td className="px-4 py-2">vm-db-1</td>
                    <td className="px-4 py-2">t3.large</td>
                    <td className="px-4 py-2">us-east-1</td>
                    <td className="px-4 py-2">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Stopped</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Buckets Section */}
        <div className="border rounded-lg overflow-hidden">
          <div
            onClick={() => setBucketOpen(!bucketOpen)}
            className="bg-gray-100 px-4 py-2 flex justify-between items-center cursor-pointer"
          >
            <span className="font-semibold text-gray-700">Storage Buckets (43)</span>
            {bucketOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {bucketOpen && (
            <div className="overflow-x-auto transition-all duration-300 ease-in-out">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Bucket Name</th>
                    <th className="px-4 py-2 text-left">Region</th>
                    <th className="px-4 py-2 text-left">Storage Class</th>
                    <th className="px-4 py-2 text-left">Size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">production-backups</td>
                    <td className="px-4 py-2">us-west-1</td>
                    <td className="px-4 py-2">Standard</td>
                    <td className="px-4 py-2">3.1 TB</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">analytics-logs</td>
                    <td className="px-4 py-2">eu-west-1</td>
                    <td className="px-4 py-2">Glacier</td>
                    <td className="px-4 py-2">800 GB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Clusters Section */}
        <div className="border rounded-lg overflow-hidden">
          <div
            onClick={() => setClusterOpen(!clusterOpen)}
            className="bg-gray-100 px-4 py-2 flex justify-between items-center cursor-pointer"
          >
            <span className="font-semibold text-gray-700">Clusters (12)</span>
            {clusterOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {clusterOpen && (
            <div className="overflow-x-auto transition-all duration-300 ease-in-out">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Cluster Name</th>
                    <th className="px-4 py-2 text-left">Nodes</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Region</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">prod-cluster</td>
                    <td className="px-4 py-2">6</td>
                    <td className="px-4 py-2">EKS</td>
                    <td className="px-4 py-2">us-west-1</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">dev-cluster</td>
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">EKS</td>
                    <td className="px-4 py-2">us-west-1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* IAM Users Section */}
        <div className="border rounded-lg overflow-hidden">
          <div
            onClick={() => setIamOpen(!iamOpen)}
            className="bg-gray-100 px-4 py-2 flex justify-between items-center cursor-pointer"
          >
            <span className="font-semibold text-gray-700">IAM Users (89)</span>
            {iamOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {iamOpen && (
            <div className="overflow-x-auto transition-all duration-300 ease-in-out">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">dev.analyst</td>
                    <td className="px-4 py-2">Analyst</td>
                    <td className="px-4 py-2">2023-07-02</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">splunkroot</td>
                    <td className="px-4 py-2">Operations</td>
                    <td className="px-4 py-2">2023-05-06</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default cloudAssetScanInfoPage;
