/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { ImageReceiptModal } from './components/common/ImageReceiptModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { VendorPortal } from './components/vendor/VendorPortal';
import { DriverApp } from './components/driver/DriverApp';
import { CustomerApp } from './components/customer/CustomerApp';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { GoogleMapsWrapper } from './components/maps/GoogleMapsWrapper';
import { PortalAuthGate } from './components/auth/PortalAuthGate';

const AppContent: React.FC = () => {
  const { activePortal } = usePlatform();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-['Readex_Pro','Cairo',sans-serif]">
      {/* Main Active Standalone Portal View */}
      <div className="flex-1">
        {activePortal === 'admin' && (
          <PortalAuthGate portal="admin">
            <SuperAdminDashboard />
          </PortalAuthGate>
        )}
        {activePortal === 'vendor' && (
          <PortalAuthGate portal="vendor">
            <VendorPortal />
          </PortalAuthGate>
        )}
        {activePortal === 'driver' && (
          <PortalAuthGate portal="driver">
            <DriverApp />
          </PortalAuthGate>
        )}
        {activePortal === 'customer' && <CustomerApp />}
        {activePortal === 'onboarding' && <OnboardingScreen />}
      </div>

      {/* Global Image/Receipt Inspection Modal */}
      <ImageReceiptModal />

      {/* Global Real-time Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <GoogleMapsWrapper>
        <AppContent />
      </GoogleMapsWrapper>
    </PlatformProvider>
  );
}
