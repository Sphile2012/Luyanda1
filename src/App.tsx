import { Component, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-8">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
            <pre className="text-sm text-red-400 bg-gray-900 rounded-lg p-4 text-left overflow-auto">
              {(this.state.error as Error).message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import Home from './pages/public/Home';
import Buyers from './pages/public/Buyers';
import Dealerships from './pages/public/Dealerships';
import BecomeAgent from './pages/public/BecomeAgent';
import About from './pages/public/About';
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
    <ErrorBoundary>
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
            path="/about"
            element={
              <PublicLayout>
                <About />
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
    </ErrorBoundary>
  );
}

export default App;
