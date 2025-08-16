import React from "react";
import { FaNetworkWired, FaUser, FaLock, FaCheckCircle } from "react-icons/fa";

const InstalledSoftwarePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Fetch Installed Software Card */}
      <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-gray-800">
          Fetch Installed Software
        </h2>

        {/* Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* IP Address Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaNetworkWired />
            </span>
            <input
              type="text"
              placeholder="Enter IP address"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Username Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaUser />
            </span>
            <input
              type="text"
              placeholder="Enter Username"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Checkbox & Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 mr-2"
            />
            Also perform ClamAV malware scan
          </label>

          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 w-fit">
            Get Software Info
          </button>
        </div>
      </div>

      {/* Software Info Section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        {/* Device Info Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-lg font-semibold text-gray-800">
              192.168.1.100
            </div>
            <div className="text-sm text-gray-500">Windows 10 Pro</div>
          </div>
          <div className="text-sm text-gray-500">Last updated: 2 mins ago</div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-800">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-800">Version</th>
                <th className="px-4 py-3 font-semibold text-gray-800">Publisher</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Google Chrome", "114.0.5735.91", "Google LLC"],
                ["Microsoft Edge", "123.0.0.0", "Microsoft Corp."],
                ["7-Zip", "22.00", "Igor Pavlov"],
                ["Adobe Acrobat Reader", "2023.001.20148", "Adobe Systems Incorporated"],
                ["Visual Studio Code", "1.77.3", "Microsoft Corporation"],
              ].map(([name, version, publisher], idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 border-t border-gray-100"
                >
                  <td className="px-4 py-3 text-gray-800">{name}</td>
                  <td className="px-4 py-3 text-gray-800">{version}</td>
                  <td className="px-4 py-3 text-gray-800">{publisher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Malware Scan Result */}
        <div className="flex items-center text-green-600 text-sm gap-2 pt-3 pl-2">
          <FaCheckCircle />
          <span>Malware Scan Result: Clean</span>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            className="bg-gray-100 text-gray-400 px-3 py-1 rounded-md cursor-not-allowed"
            disabled
          >
            Previous
          </button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded-md">
            1
          </button>
          <button className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstalledSoftwarePage;
