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

// Layout
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

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

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <Topbar activePage={activePage} />
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
