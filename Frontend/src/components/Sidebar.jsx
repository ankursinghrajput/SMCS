import { useAuth } from '../context/AuthContext';

const navConfig = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'attendance', label: 'My Attendance', icon: '📅' },
    { id: 'marks', label: 'My Marks', icon: '📝' },
    { id: 'notices', label: 'Notices', icon: '📢', badge: 2 },
  ],
  faculty: [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'marks', label: 'Marks', icon: '📝' },
    { id: 'notices', label: 'Notices', icon: '📢', badge: 1 },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'marks', label: 'Marks', icon: '📝' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
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
          src="/smcs_logo.png"
          alt="SMCS Logo"
          style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }}
        />
        <div>
          <div className="sidebar-brand">SMCS</div>
          <div className="sidebar-brand-sub">Sanjeev Memorial Center</div>
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
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
