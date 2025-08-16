import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import SoftwareVulnerabilitiesPage from './pages/SoftwareVulnerabilities'; // ✅ new import
import GenerateAgentPage from './pages/GenerateAgentPage';
import AgentHub from './pages/AgentHub';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="network-assets" element={<FinalCloudAssetPage />} />
          <Route path="cloud-scan-history" element={<CloudScanHistoryPage />} />
          <Route path="active-devices" element={<FinalDevicesPage />} />
          <Route path="port-vulnerabilities" element={<PortVulnerabilitiesPage />} />
          <Route path="software-vulnerabilities" element={<SoftwareVulnerabilitiesPage />} />
          <Route path="scan-history" element={<ScanHistoryPage />} />
          <Route path="additional-information" element={<FinalAdditionalInfoPage />} />
          <Route path="/cloud-assets" element={<FinalCloudAssetPage/>} />
          <Route path="/installed-software" element={<InstalledSoftwarePage />} />
          <Route path="/scan-info" element={<CloudAssetScanInfoPage />}/>
          <Route path="/generate-agent" element={<GenerateAgentPage/>}/>
          <Route path="/agent-hub" element={<AgentHub/>}/>
        </Route>
      </Routes>
    </Router>
  );
}
