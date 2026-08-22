import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminImport } from './pages/AdminImport';
import { AdminCandidates } from './pages/AdminCandidates';
import { AdminScanner } from './pages/AdminScanner';
import { AdminAttendance } from './pages/AdminAttendance';
import { AdminEvents } from './pages/AdminEvents';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f8fbff] text-slate-500 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f8fbff] text-slate-500 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading portal...</span>
        </div>
      </div>
    );
  }

  if (role === 'STUDENT') {
    return <Navigate to="/pass" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f8fbff] text-slate-900 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home & Auth */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pass" element={<StudentDashboard />} />

              {/* Protected Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/import"
                element={
                  <ProtectedAdminRoute>
                    <AdminImport />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/candidates"
                element={
                  <ProtectedAdminRoute>
                    <AdminCandidates />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/scanner"
                element={
                  <ProtectedAdminRoute>
                    <AdminScanner />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedAdminRoute>
                    <AdminAttendance />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedAdminRoute>
                    <AdminEvents />
                  </ProtectedAdminRoute>
                }
              />

              {/* Legacy / Alias Redirects */}
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/import" element={<Navigate to="/import" replace />} />
              <Route path="/admin/candidates" element={<Navigate to="/candidates" replace />} />
              <Route path="/admin/scanner" element={<Navigate to="/scanner" replace />} />
              <Route path="/admin/attendance" element={<Navigate to="/attendance" replace />} />
              <Route path="/admin/events" element={<Navigate to="/events" replace />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
