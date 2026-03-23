import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PublicInvitation = lazy(() => import('./pages/public/PublicInvitation'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminGuests = lazy(() => import('./pages/admin/AdminGuests'));
const AdminBudget = lazy(() => import('./pages/admin/AdminBudget'));
const AdminVendors = lazy(() => import('./pages/admin/AdminVendors'));
const AdminSeating = lazy(() => import('./pages/admin/AdminSeating'));
const AdminEditor = lazy(() => import('./pages/admin/AdminEditor'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

const Loading = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F3E4' }}>
    <div style={{ fontFamily: 'var(--font-sc)', fontSize: '0.75rem', letterSpacing: '0.2em', opacity: 0.5 }}>CARGANDO AURA...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public SaaS Marketing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Dynamic Public Invitations */}
            <Route path="/:slug" element={<PublicInvitation />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Dashboard (Protected) */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/invitados" element={
              <ProtectedRoute>
                <AdminGuests />
              </ProtectedRoute>
            } />
            <Route path="/admin/presupuesto" element={
              <ProtectedRoute>
                <AdminBudget />
              </ProtectedRoute>
            } />
            <Route path="/admin/proveedores" element={
              <ProtectedRoute>
                <AdminVendors />
              </ProtectedRoute>
            } />
            <Route path="/admin/mesas" element={
              <ProtectedRoute>
                <AdminSeating />
              </ProtectedRoute>
            } />
            <Route path="/admin/diseno" element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracion" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />

            {/* Catch all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
