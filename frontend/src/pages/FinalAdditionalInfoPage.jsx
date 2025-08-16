import { FaPlay, FaDownload } from "react-icons/fa";

export default function FinalAdditionalInfoPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold">Additional Info</h1>

        {/* Action Buttons (correct style from FinalDevicesPage) */}
        <div className="flex gap-3 mt-4">
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

      {/* Get System Details Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Get System Details</h2>

        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">IP Address</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter IP address"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">Hostname</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter hostname"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 w-32">Password</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 text-sm w-[260px]"
              placeholder="Enter password"
              type="password"
            />
          </div>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-semibold rounded shadow">
          Fetch Additional Info
        </button>
      </div>

      {/* Results Card */}
      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        {/* IP and OS Info */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2 text-sm text-gray-800">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="font-medium">192.168.1.100</span>
            <span className="text-gray-500">DESKTOP-ABC123</span>
          </div>
          <span className="text-sm text-gray-500">Windows 10</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-sm text-gray-800">
          {/* Left Column */}
          <div>
            <h3 className="font-semibold mb-2">System Information</h3>
            <InfoRow label="OS Name" value="Microsoft Windows 10 Enterprise" />
            <InfoRow label="OS Version" value="10.0.19045" />
            <InfoRow label="System Manufacturer" value="Dell Inc." />
            <InfoRow label="System Model" value="Latitude 5490" />
            <InfoRow label="System Type" value="x64-based PC" />
            <InfoRow label="BIOS Version" value="1.14.0" />

            <h3 className="font-semibold mt-6 mb-2">Network Configuration</h3>
            <InfoRow
              label="Network Adapter"
              value="Intel(R) Ethernet Connection I219-LM"
            />
            <InfoRow label="Domain/Workgroup" value="WORKGROUP" />
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-semibold mb-2">Memory Information</h3>
            <InfoRow label="Total Physical Memory" value="16.0 GB" />
            <InfoRow label="Available Physical Memory" value="8.2 GB" />
            <InfoRow label="Total Virtual Memory" value="24.0 GB" />
            <InfoRow label="Available Virtual Memory" value="12.5 GB" />

            <h3 className="font-semibold mt-6 mb-2">System Details</h3>
            <p className="mb-1">
              Boot Time: <strong>2024-01-20 09:30:45</strong>
            </p>
            <p className="mb-1">Installed Hotfixes:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {["KB5026446", "KB5026450", "KB5026448"].map((kb) => (
                <span
                  key={kb}
                  className="bg-gray-100 border border-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {kb}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Export Button (correct style from FinalDevicesPage) */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-[#F3F4F6] text-[#374151] border border-[#D1D5DB] px-4 py-2 rounded-md font-medium text-sm">
            <FaDownload className="text-xs" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="mb-1">
      {label}: <strong>{value}</strong>
    </p>
  );
}
