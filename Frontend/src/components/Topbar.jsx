import { useAuth } from '../context/AuthContext';

export default function Topbar({ activePage }) {
  const { user } = useAuth();

  const pageTitles = {
    dashboard: 'Dashboard',
    students: 'Student Management',
    faculty: 'Faculty Management',
    attendance: 'Attendance',
    marks: 'Marks & Grades',
    notices: 'Notice Board',
    classes: 'Classes',
  };

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const avatarBg = { student: '#e8f4fd', faculty: '#d1fae5', admin: '#ede9fe' };
  const avatarColor = { student: '#155fa0', faculty: '#059669', admin: '#6d28d9' };

  return (
    <header className="topbar" role="banner">
      <div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--clr-text-primary)'
        }}>
          {pageTitles[activePage] || 'SMCS'}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '1px' }}>{now}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Greeting */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--clr-bg)', borderRadius: 'var(--radius-md)',
          padding: '8px 14px'
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: avatarBg[user?.role] || '#e8f4fd',
            color: avatarColor[user?.role] || '#155fa0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
