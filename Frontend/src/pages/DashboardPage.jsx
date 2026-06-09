import { useAuth } from '../context/AuthContext';
import { dummyAttendance, dummyMarks, dummyNotices, dummyAnalytics } from '../data/dummyData';

// Circular Progress Component
function CircularProgress({ percentage, size = 80, color = 'var(--clr-primary)' }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" role="img" aria-label={`${percentage}%`}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="var(--clr-border)" strokeWidth="6" />
      <circle
        cx="35" cy="35" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="35" y="40" textAnchor="middle"
        fill="var(--clr-text-primary)"
        fontSize="12" fontWeight="700" fontFamily="Outfit, sans-serif"
      >
        {percentage}%
      </text>
    </svg>
  );
}

// Student Dashboard
function StudentDashboard({ user }) {
  const recentNotices = dummyNotices.slice(0, 3);
  const lowAttendance = dummyAttendance.filter(s => s.percentage < 75);
  const avgMark = Math.round(dummyMarks.reduce((a, b) => a + b.marks, 0) / dummyMarks.length);
  const overallAttendance = Math.round(
    dummyAttendance.reduce((a, b) => a + b.percentage, 0) / dummyAttendance.length
  );

  return (
    <div className="fade-in-up">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--clr-primary), #155fa0)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '28px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Good Morning,</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            {user?.name} 👋
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>
            You have <strong style={{ color: '#fbbf24' }}>{lowAttendance.length} subject{lowAttendance.length !== 1 ? 's' : ''}</strong> with low attendance. Stay on track!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Overall Attendance', value: `${overallAttendance}%`, icon: '📅', color: '#e8f4fd', iconBg: '#1a7fce' },
          { label: 'Subjects Enrolled', value: dummyAttendance.length, icon: '📚', color: '#d1fae5', iconBg: '#10b981' },
          { label: 'Average Marks', value: `${avgMark}/100`, icon: '📝', color: '#ede9fe', iconBg: '#8b5cf6' },
          { label: 'Notices Unread', value: 2, icon: '📢', color: '#fef3c7', iconBg: '#f59e0b' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Attendance Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Attendance Summary</h3>
            {lowAttendance.length > 0 && (
              <span className="badge badge-danger">⚠️ {lowAttendance.length} Low</span>
            )}
          </div>
          {dummyAttendance.map((item, i) => {
            const color = item.percentage >= 75 ? 'var(--clr-secondary)' : 'var(--clr-danger)';
            return (
              <div className="attendance-item" key={i}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)', minWidth: '140px' }}>
                  {item.subjectName}
                </span>
                <div className="attendance-bar-wrap">
                  <div className="attendance-bar-bg">
                    <div className="attendance-bar-fill" style={{ width: `${item.percentage}%`, background: color }} />
                  </div>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color, minWidth: '48px', textAlign: 'right' }}>
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recent Marks */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📝 Recent Marks</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dummyMarks.slice(0, 4).map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.subject.name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--clr-text-muted)' }}>{m.examType}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800,
                      color: m.marks >= 75 ? 'var(--clr-secondary-dark)' : m.marks >= 40 ? 'var(--clr-primary)' : 'var(--clr-danger)'
                    }}>{m.marks}</span>
                    <span className={`badge ${m.marks >= 75 ? 'badge-success' : m.marks >= 40 ? 'badge-primary' : 'badge-danger'}`}>
                      {m.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notices */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📢 Recent Notices</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentNotices.map((n, i) => {
                const dotColor = n.audience === 'all' ? 'var(--clr-primary)' : n.audience === 'student' ? 'var(--clr-secondary)' : 'var(--clr-accent)';
                return (
                  <div className="notice-item" key={i}>
                    <div className="notice-dot" style={{ background: dotColor }} />
                    <div>
                      <div className="notice-title">{n.title}</div>
                      <div className="notice-meta">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        &nbsp;·&nbsp;<span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 7px' }}>{n.audience}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin / Faculty Dashboard
function AdminDashboard({ user }) {
  const { totalStudents, totalFaculty, totalClasses, averageAttendance } = dummyAnalytics;

  const stats = user.role === 'admin'
    ? [
        { label: 'Total Students', value: totalStudents, icon: '🎓', color: '#e8f4fd' },
        { label: 'Total Faculty', value: totalFaculty, icon: '👨‍🏫', color: '#d1fae5' },
        { label: 'Total Classes', value: totalClasses, icon: '🏫', color: '#ede9fe' },
        { label: 'Avg Attendance', value: `${averageAttendance}%`, icon: '📅', color: '#fef3c7' },
      ]
    : [
        { label: 'My Students', value: 62, icon: '🎓', color: '#e8f4fd' },
        { label: 'Classes Assigned', value: 3, icon: '🏫', color: '#d1fae5' },
        { label: 'Avg Attendance', value: `${averageAttendance}%`, icon: '📅', color: '#ede9fe' },
        { label: 'Notices Posted', value: 4, icon: '📢', color: '#fef3c7' },
      ];

  return (
    <div className="fade-in-up">
      {/* Banner */}
      <div style={{
        background: user.role === 'admin'
          ? 'linear-gradient(135deg, #155fa0, #8b5cf6)'
          : 'linear-gradient(135deg, #059669, #1a7fce)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {user?.name} {user.role === 'admin' ? '🛡️' : '👨‍🏫'}
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>
            {user.role === 'admin'
              ? `Managing ${totalStudents} students across ${totalClasses} classes`
              : 'Managing your classes and student records'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Marks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Recent Marks Uploaded</h3>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Rahul Sharma', subject: 'Mathematics', exam: 'Mid-Term', marks: 88, grade: 'A' },
                  { name: 'Priya Patel', subject: 'Physics', exam: 'Mid-Term', marks: 74, grade: 'B+' },
                  { name: 'Arjun Mehta', subject: 'Chemistry', exam: 'Final', marks: 52, grade: 'C' },
                  { name: 'Sneha Reddy', subject: 'English', exam: 'Final', marks: 91, grade: 'A+' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-primary" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                          {r.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {r.name}
                      </div>
                    </td>
                    <td>{r.subject}</td>
                    <td><span className="badge badge-primary">{r.exam}</span></td>
                    <td><strong>{r.marks}</strong>/100</td>
                    <td><span className={`badge ${r.marks >= 75 ? 'badge-success' : r.marks >= 40 ? 'badge-primary' : 'badge-danger'}`}>{r.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📢 Recent Notices</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dummyNotices.map((n, i) => {
              const dotColor = n.audience === 'all' ? 'var(--clr-primary)' : n.audience === 'student' ? 'var(--clr-secondary)' : 'var(--clr-accent)';
              return (
                <div className="notice-item" key={i}>
                  <div className="notice-dot" style={{ background: dotColor }} />
                  <div>
                    <div className="notice-title">{n.title}</div>
                    <div className="notice-meta">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      &nbsp;·&nbsp;<span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{n.audience}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'student'
    ? <StudentDashboard user={user} />
    : <AdminDashboard user={user} />;
}
