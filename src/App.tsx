import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import Home from './pages/public/Home';
import Buyers from './pages/public/Buyers';
import Dealerships from './pages/public/Dealerships';
import BecomeAgent from './pages/public/BecomeAgent';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import Popia from './pages/legal/Popia';
import PortalEntry from './pages/portal/PortalEntry';
import ResetPassword from './pages/portal/ResetPassword';
import AgentDashboard from './pages/portal/AgentDashboard';
import ManagementDashboard from './pages/portal/ManagementDashboard';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/buyers"
            element={
              <PublicLayout>
                <Buyers />
              </PublicLayout>
            }
          />
          <Route
            path="/dealerships"
            element={
              <PublicLayout>
                <Dealerships />
              </PublicLayout>
            }
          />
          <Route
            path="/become-agent"
            element={
              <PublicLayout>
                <BecomeAgent />
              </PublicLayout>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicLayout>
                <PrivacyPolicy />
              </PublicLayout>
            }
          />
          <Route
            path="/terms"
            element={
              <PublicLayout>
                <Terms />
              </PublicLayout>
            }
          />
          <Route
            path="/popia"
            element={
              <PublicLayout>
                <Popia />
              </PublicLayout>
            }
          />

          {/* Portal Routes */}
          <Route path="/portal" element={<PortalEntry />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/management-dashboard" element={<ManagementDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
