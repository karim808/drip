/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { PortalSwitcherBar } from './components/common/PortalSwitcherBar';
import { ImageReceiptModal } from './components/common/ImageReceiptModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { VendorPortal } from './components/vendor/VendorPortal';
import { DriverApp } from './components/driver/DriverApp';
import { CustomerApp } from './components/customer/CustomerApp';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { GoogleMapsWrapper } from './components/maps/GoogleMapsWrapper';

const AppContent: React.FC = () => {
  const { activePortal } = usePlatform();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-['Readex_Pro','Cairo',sans-serif]">
      {/* Top Prototype Switcher Bar */}
      <PortalSwitcherBar />

      {/* Main Active View */}
      <div className="flex-1">
        {activePortal === 'admin' && <SuperAdminDashboard />}
        {activePortal === 'vendor' && <VendorPortal />}
        {activePortal === 'driver' && <DriverApp />}
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
