import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NoticesPage from './pages/NoticesPage';

// Student Pages
import AttendancePage from './pages/student/AttendancePage';
import MarksPage from './pages/student/MarksPage';

// Admin / Faculty Pages
import StudentsPage from './pages/admin/StudentsPage';
import FacultyPage from './pages/admin/FacultyPage';
import AdminMarksPage from './pages/admin/MarksPage';
import AdminAttendancePage from './pages/admin/AttendancePage';
import ClassesPage from './pages/admin/ClassesPage';
import SubjectsPage from './pages/admin/SubjectsPage';

// Layout
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth is still being verified — show a neutral full-screen loader ──
  // This prevents the login page from flashing before the /api/profile
  // response comes back on a hard refresh.
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        gap: '20px',
      }}>
        <img
          src="/SMCS_logo_nobg_trimmed.png"
          alt="SMCS"
          style={{ width: '80px', height: '80px', objectFit: 'contain', opacity: 0.85 }}
        />
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#183B65',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        <p style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
          Loading…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Determine which page component to render
  const renderPage = () => {
    const role = user.role;

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;

      case 'attendance':
        return role === 'student' ? <AttendancePage /> : <AdminAttendancePage />;

      case 'marks':
        return role === 'student' ? <MarksPage /> : <AdminMarksPage />;

      case 'notices':
        return <NoticesPage />;

      case 'students':
        return <StudentsPage />;

      case 'faculty':
        return <FacultyPage />;

      case 'classes':
        return <ClassesPage />;

      case 'subjects':
        return <SubjectsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Topbar activePage={activePage} onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-wrapper" role="main">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
