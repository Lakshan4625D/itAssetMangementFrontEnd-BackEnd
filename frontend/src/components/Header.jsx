import { Bell, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-xl font-semibold text-gray-800">Net Asset Scanner</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          className="border px-2 py-1 rounded-md text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Bell className="text-gray-500 w-5 h-5 cursor-pointer" />
        <UserCircle className="text-gray-500 w-6 h-6 cursor-pointer" />
      </div>
    </header>
  );
}
