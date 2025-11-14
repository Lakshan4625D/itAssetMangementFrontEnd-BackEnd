import React, { useState, useEffect } from "react";
import {
  FaServer,
  FaCloud,
  FaNetworkWired,
  FaUser,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useParams } from "react-router-dom";

const CloudAssetScanInfoPage = () => {
  const { scan_id } = useParams();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [vmOpen, setVmOpen] = useState(true);
  const [bucketOpen, setBucketOpen] = useState(false);
  const [clusterOpen, setClusterOpen] = useState(false);
  const [iamOpen, setIamOpen] = useState(false);

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        const res = await fetch(`http://backend:8000/cloud-scans/${scan_id}`);
        if (!res.ok) throw new Error("Failed to fetch scan data");
        const data = await res.json();
        setScanData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScanData();
  }, [scan_id]);

  if (loading) return <div className="p-6">Loading scan details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!scanData) return <div className="p-6">No scan data found.</div>;

  const { scan, summary, vms, buckets, clusters, iam_users } = scanData;

  /** ----------- PROVIDER-BASED FIELD MAPPING ----------- **/

  // VM columns
  const vmColumns =
    scan.provider === "AWS"
      ? ["Instance ID", "Type", "State", "Public IP", "Region"]
      : scan.provider === "GCP"
      ? ["Name", "Zone", "Status", "Machine Type"]
      : ["VM Name", "Location", "VM Type", "VM Size"]; // Azure

  // Bucket columns
  const bucketColumns =
    scan.provider === "AWS"
      ? ["Bucket Name", "Creation Date"]
      : scan.provider === "GCP"
      ? ["Bucket Name", "Location", "Storage Class"]
      : ["Name", "Location", "Kind", "SKU"]; // ✅ Azure real fields

  // Cluster columns
  const clusterColumns =
    scan.provider === "AWS"
      ? ["Cluster Name", "Status", "Active Services", "Running Tasks", "Region"]
      : scan.provider === "GCP"
      ? ["Cluster Name", "Location", "Status", "Endpoint"]
      : ["Name", "Location", "Version", "DNS Prefix"]; // ✅ Azure real fields

  // IAM user columns
  const iamColumns = ["Username", "Role", "Created"];

  /** ----------- FIELD EXTRACTORS PER PROVIDER ----------- **/

  const renderVmRow = (vm, idx) => {
    if (scan.provider === "AWS") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{vm.instance_id}</td>
          <td className="px-4 py-2">{vm.type}</td>
          <td className="px-4 py-2">{vm.state}</td>
          <td className="px-4 py-2">{vm.public_ip}</td>
          <td className="px-4 py-2">{vm.region}</td>
        </tr>
      );
    }
    if (scan.provider === "GCP") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{vm.name}</td>
          <td className="px-4 py-2">{vm.zone}</td>
          <td className="px-4 py-2">{vm.status}</td>
          <td className="px-4 py-2">{vm.machine_type}</td>
        </tr>
      );
    }
    // Azure
    return (
      <tr key={idx} className="hover:bg-gray-50">
        <td className="px-4 py-2">{vm.name}</td>
        <td className="px-4 py-2">{vm.location}</td>
        <td className="px-4 py-2">{vm.vm_type}</td>
        <td className="px-4 py-2">{vm.vm_size}</td>
      </tr>
    );
  };

  const renderBucketRow = (bucket, idx) => {
    if (scan.provider === "AWS") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{bucket.name}</td>
          <td className="px-4 py-2">{bucket.creation_date}</td>
        </tr>
      );
    }
    if (scan.provider === "GCP") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{bucket.name}</td>
          <td className="px-4 py-2">{bucket.location}</td>
          <td className="px-4 py-2">{bucket.storage_class}</td>
        </tr>
      );
    }
    // ✅ Azure
    return (
      <tr key={idx} className="hover:bg-gray-50">
        <td className="px-4 py-2">{bucket.name}</td>
        <td className="px-4 py-2">{bucket.location}</td>
        <td className="px-4 py-2">{bucket.kind}</td>
        <td className="px-4 py-2">{bucket.sku}</td>
      </tr>
    );
  };

  const renderClusterRow = (cl, idx) => {
    if (scan.provider === "AWS") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{cl.name}</td>
          <td className="px-4 py-2">{cl.status}</td>
          <td className="px-4 py-2">{cl.active_services}</td>
          <td className="px-4 py-2">{cl.running_tasks}</td>
          <td className="px-4 py-2">{cl.region}</td>
        </tr>
      );
    }
    if (scan.provider === "GCP") {
      return (
        <tr key={idx} className="hover:bg-gray-50">
          <td className="px-4 py-2">{cl.name}</td>
          <td className="px-4 py-2">{cl.location}</td>
          <td className="px-4 py-2">{cl.status}</td>
          <td className="px-4 py-2">{cl.endpoint}</td>
        </tr>
      );
    }
    // ✅ Azure
    return (
      <tr key={idx} className="hover:bg-gray-50">
        <td className="px-4 py-2">{cl.name}</td>
        <td className="px-4 py-2">{cl.location}</td>
        <td className="px-4 py-2">{cl.version}</td>
        <td className="px-4 py-2">{cl.dns_prefix}</td>
      </tr>
    );
  };

  const renderIamRow = (user, idx) => (
    <tr key={idx} className="hover:bg-gray-50">
      <td className="px-4 py-2">{user.username}</td>
      <td className="px-4 py-2">{user.role}</td>
      <td className="px-4 py-2">{user.created}</td>
    </tr>
  );

  /** ----------- UI RENDER ----------- **/
  return (
    <div className="p-6 mb-8 text-sm font-inter bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-800">
          Cloud Scan History / Scan Information
        </h1>

        {/* Scan Summary */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-semibold">Provider:</p>
            <p>{scan.provider}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                scan.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {scan.status}
            </span>
          </div>
          <div>
            <p className="font-semibold">Scan Time:</p>
            <p>{scan.scan_time}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <FaServer className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{summary.total_vms}</div>
            <div>Virtual Machines</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <FaCloud className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{summary.total_buckets}</div>
            <div>Storage Buckets</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <FaNetworkWired className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{summary.total_clusters}</div>
            <div>Kubernetes Clusters</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <FaUser className="text-xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{summary.total_iam_users}</div>
            <div>IAM Users</div>
          </div>
        </div>

        {/* VMs */}
        <Section
          title={`Virtual Machines (${vms.length})`}
          isOpen={vmOpen}
          toggle={() => setVmOpen(!vmOpen)}
          columns={vmColumns}
          rows={vms}
          renderRow={renderVmRow}
        />

        {/* Buckets */}
        <Section
          title={`Storage Buckets (${buckets.length})`}
          isOpen={bucketOpen}
          toggle={() => setBucketOpen(!bucketOpen)}
          columns={bucketColumns}
          rows={buckets}
          renderRow={renderBucketRow}
        />

        {/* Clusters */}
        <Section
          title={`Clusters (${clusters.length})`}
          isOpen={clusterOpen}
          toggle={() => setClusterOpen(!clusterOpen)}
          columns={clusterColumns}
          rows={clusters}
          renderRow={renderClusterRow}
        />

        {/* IAM Users */}
        <Section
          title={`IAM Users (${iam_users.length})`}
          isOpen={iamOpen}
          toggle={() => setIamOpen(!iamOpen)}
          columns={iamColumns}
          rows={iam_users}
          renderRow={renderIamRow}
        />
      </div>
    </div>
  );
};

/** Generic Section Component */
const Section = ({ title, isOpen, toggle, columns, rows, renderRow }) => (
  <div className="border rounded-lg overflow-hidden">
    <div
      onClick={toggle}
      className="bg-gray-100 px-4 py-2 flex justify-between items-center cursor-pointer"
    >
      <span className="font-semibold text-gray-700">{title}</span>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </div>
    {isOpen && (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-2 text-gray-500" colSpan={columns.length}>
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => renderRow(row, idx))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default CloudAssetScanInfoPage;
