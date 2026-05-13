/** @format */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useSSE } from './hooks/useSSE';
import { Layout } from './components/layout/Layout';
import { CommandPalette } from './components/ui/CommandPalette';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageTransition } from './components/ui/PageTransition';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { GlobalScanOverlay } from './components/ui/GlobalScanOverlay';
import { DisruptionAlert, ActiveDisruptionBanner } from './components/ui/DisruptionAlert';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { ShipmentDetailPage } from './pages/ShipmentDetailPage';
import { DecisionsPage } from './pages/DecisionsPage';
import { NetworkPage } from './pages/NetworkPage';
import { ActivityPage } from './pages/ActivityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScanShipmentPage } from './pages/ScanShipmentPage';
import { NotFoundPage } from './pages/NotFoundPage';

function SSEWrapper({ children }: { children: React.ReactNode }) {
  useSSE();
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
        <Route path="/decisions" element={<DecisionsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/scan" element={<ScanShipmentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageTransition>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SSEWrapper>
        <Layout>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
          <CommandPalette />
          <KeyboardShortcuts />
          <GlobalScanOverlay />
          <ActiveDisruptionBanner />
        </Layout>
        <DisruptionAlert />
      </SSEWrapper>
    </BrowserRouter>
  );
}

export default App;
