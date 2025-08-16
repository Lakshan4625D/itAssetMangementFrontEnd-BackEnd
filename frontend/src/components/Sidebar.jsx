import {
  Cloud,
  HardDrive,
  Radio,
  History,
  Info,
  Laptop,
  RotateCw,
  AlertTriangle,
  FilePlus,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItemClass =
    'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#1E293B] text-sm';
  const activeClass =
    'bg-white bg-opacity-10 font-semibold border-l-4 border-blue-400 text-white';

  return (
    <aside className="w-60 h-screen bg-[#0F172A] text-white flex flex-col py-6 px-4 space-y-6 overflow-y-auto">
      {/* Top Title */}
      <div className="text-lg font-bold flex items-center gap-2 px-2">
        <Cloud className="w-5 h-5 text-white" />
        <span>Net Asset Scanner</span>
      </div>

      {/* Dashboard */}
      <div>
        <div className="uppercase text-xs font-semibold text-gray-400 px-2 mb-2">Dashboard</div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${navItemClass} ${isActive ? activeClass : ''}`
          }
        >
          <Cloud className="w-4 h-4 text-white" />
          <span>Dashboard</span>
        </NavLink>
      </div>

      {/* Network Assets */}
      <div>
        <div className="uppercase text-xs font-semibold text-gray-400 px-2 mb-2">Network Assets</div>
        <div className="flex flex-col space-y-1">
          <NavLink
            to="/active-devices"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <HardDrive className="w-4 h-4" />
            <span>Devices</span>
          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <Radio className="w-4 h-4" />
            <span>Active Devices</span>
          </NavLink>

          <NavLink
            to="/scan-history"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <History className="w-4 h-4" />
            <span>Scan History</span>
          </NavLink>

          <NavLink
            to="/additional-information"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <Info className="w-4 h-4" />
            <span>Additional Information</span>
          </NavLink>

          <NavLink
            to="/installed-software"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <Laptop className="w-4 h-4" />
            <span>Installed Software</span>
          </NavLink>
        </div>
      </div>

      {/* Cloud */}
      <div>
        <div className="uppercase text-xs font-semibold text-gray-400 px-2 mb-2">Cloud</div>
        <div className="flex flex-col space-y-1">
          <NavLink
            to="/cloud-assets"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Assets</span>
          </NavLink>

          <NavLink
            to="/cloud-scan-history"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <RotateCw className="w-4 h-4" />
            <span>Cloud Scan History</span>
          </NavLink>
        </div>
      </div>

      {/* Vulnerabilities */}
      <div>
        <div className="uppercase text-xs font-semibold text-gray-400 px-2 mb-2">Vulnerabilities</div>
        <div className="flex flex-col space-y-1">
          <NavLink
            to="/port-vulnerabilities"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Port Vulnerabilities</span>
          </NavLink>

          <NavLink
            to="/software-vulnerabilities"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Software Vulnerabilities</span>
          </NavLink>
        </div>
      </div>

      {/* Agents */}
      <div>
        <div className="uppercase text-xs font-semibold text-gray-400 px-2 mb-2">Agents</div>
        <div className="flex flex-col space-y-1">
          <NavLink
            to="/generate-agent"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <FilePlus className="w-4 h-4" />
            <span>Generate Agent</span>
          </NavLink>

          <NavLink
            to="/agent-hub"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : ''}`
            }
          >
            <Users className="w-4 h-4" />
            <span>Agent Hub</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
