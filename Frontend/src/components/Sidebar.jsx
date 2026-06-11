import { useAuth } from '../context/AuthContext';

import { Home, Calendar, ClipboardList, Bell, GraduationCap, Users, School, LogOut } from 'lucide-react';

const navConfig = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} /> },
    { id: 'attendance', label: 'My Attendance', icon: <Calendar size={20} strokeWidth={1.5} /> },
    { id: 'marks', label: 'My Marks', icon: <ClipboardList size={20} strokeWidth={1.5} /> },
    { id: 'notices', label: 'Notices', icon: <Bell size={20} strokeWidth={1.5} />, badge: 2 },
  ],
  faculty: [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} strokeWidth={1.5} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} strokeWidth={1.5} /> },
    { id: 'marks', label: 'Marks', icon: <ClipboardList size={20} strokeWidth={1.5} /> },
    { id: 'notices', label: 'Notices', icon: <Bell size={20} strokeWidth={1.5} />, badge: 1 },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} strokeWidth={1.5} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} strokeWidth={1.5} /> },
    { id: 'faculty', label: 'Faculty', icon: <Users size={20} strokeWidth={1.5} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} strokeWidth={1.5} /> },
    { id: 'marks', label: 'Marks', icon: <ClipboardList size={20} strokeWidth={1.5} /> },
    { id: 'notices', label: 'Notices', icon: <Bell size={20} strokeWidth={1.5} /> },
    { id: 'classes', label: 'Classes', icon: <School size={20} strokeWidth={1.5} /> },
  ],
};

const avatarColors = {
  student: 'avatar-primary',
  faculty: 'avatar-success',
  admin: 'avatar-accent',
};

export default function Sidebar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const navItems = navConfig[user?.role] || navConfig.student;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Header */}
      <div className="sidebar-header">
        <img
          src="/SMCS_logo_nobg_trimmed.png"
          alt="SMCS Logo"
          style={{ width: '85px', height: '85px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }}
        />
        <div>
          <div className="sidebar-brand">SMCS</div>
          <div className="sidebar-brand-sub">Sanjeev Memorial Center School</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(item => (
          <div
            key={item.id}
            id={`nav-${item.id}`}
            role="button"
            tabIndex={0}
            className={`nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={() => setActivePage(item.id)}
            onKeyDown={e => e.key === 'Enter' && setActivePage(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      {/* User Info / Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user" id="sidebar-user-menu">
          <div className={`avatar ${avatarColors[user?.role] || 'avatar-primary'}`}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            id="logout-btn"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
