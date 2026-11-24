import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { DiyaParticles } from './components/DiyaParticles';
import { FloatingControls } from './components/FloatingControls';
import { AdminGuard } from './components/AdminGuard';

import { Home } from './pages/Home';
import { MakeWish } from './pages/MakeWish';
import { PaymentStatus } from './pages/PaymentStatus';
import { Success } from './pages/Success';
import { Journey } from './pages/Journey';
import { Community } from './pages/Community';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import { AdminPortal } from './pages/AdminPortal';

export const App: React.FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-midnight-950 text-cream-100 flex flex-col selection:bg-gold-500/30 selection:text-gold-200">
      {/* Ambient background particles with reduced-motion support */}
      <DiyaParticles />

      {/* Floating unobtrusive controls (Audio & Language) */}
      <FloatingControls />

      {/* Main Page Content */}
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/make-a-wish" element={<MakeWish />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/success/:referenceId" element={<Success />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/journey/:referenceId" element={<Journey />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

          {/* Hidden Admin Sanctuary - only accessible directly via /admin1 */}
          <Route path="/admin1" element={<AdminPortal />} />

          {/* Regular /admin URLs are hidden and redirect to Home */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/admin/*" element={<Navigate to="/" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
