import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';

import FinalAdditionalInfoPage from './pages/FinalAdditionalInfoPage';
import DashboardPage from './pages/DashboardPage';
import FinalCloudAssetPage from './pages/FinalCloudAssetPage';
import CloudScanHistoryPage from './pages/CloudScanHistoryPage';
import FinalDevicesPage from './pages/FinalDevicesPage';
import PortVulnerabilitiesPage from './pages/PortVulnerabilitiesPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import CloudAssetScanInfoPage from './pages/cloudAssetScanInfoPage';
import InstalledSoftwarePage from './pages/InstalledSoftwarePage';
import SoftwareVulnerabilitiesPage from './pages/SoftwareVulnerabilities';
import GenerateAgentPage from './pages/GenerateAgentPage';
import AgentHub from './pages/AgentHub';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper */}
        <Route path="/" element={<AppLayout />}>
          
          {/* Redirect root to /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Other pages */}
          <Route path="network-assets" element={<FinalCloudAssetPage />} />
          <Route path="cloud-scan-history" element={<CloudScanHistoryPage />} />
          <Route path="active-devices" element={<FinalDevicesPage />} />
          <Route path="port-vulnerabilities" element={<PortVulnerabilitiesPage />} />
          <Route path="software-vulnerabilities" element={<SoftwareVulnerabilitiesPage />} />
          <Route path="scan-history" element={<ScanHistoryPage />} />
          <Route path="additional-information" element={<FinalAdditionalInfoPage />} />
          <Route path="cloud-assets" element={<FinalCloudAssetPage/>} />
          <Route path="installed-software" element={<InstalledSoftwarePage />} />
          <Route path="scan-info" element={<CloudAssetScanInfoPage />}/>
          <Route path="generate-agent" element={<GenerateAgentPage/>}/>
          <Route path="agent-hub" element={<AgentHub/>}/>
        </Route>
      </Routes>
    </Router>
  );
}
