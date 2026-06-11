import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, BookOpen, AlertTriangle, GraduationCap, Users, School, ClipboardList, Megaphone } from 'lucide-react';

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading Dashboard...</div>;
  }

  const attendanceDetails = data?.attendanceDetails || [];
  const attendanceWarnings = data?.attendanceWarnings || [];
  const overallAttendance = attendanceDetails.length > 0
    ? Math.round(attendanceDetails.reduce((a, b) => a + b.percentage, 0) / attendanceDetails.length)
    : 0;

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
            {user?.name}
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>
            You have <strong style={{ color: '#fbbf24' }}>{attendanceWarnings.length} subject{attendanceWarnings.length !== 1 ? 's' : ''}</strong> with low attendance. Stay on track!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Overall Attendance', value: `${overallAttendance}%`, icon: <Calendar size={24} strokeWidth={1.5} />, color: '#e8f4fd', iconBg: '#1a7fce' },
          { label: 'Subjects Enrolled', value: attendanceDetails.length, icon: <BookOpen size={24} strokeWidth={1.5} />, color: '#d1fae5', iconBg: '#10b981' },
          { label: 'Attendance Warnings', value: attendanceWarnings.length, icon: <AlertTriangle size={24} strokeWidth={1.5} />, color: '#fef3c7', iconBg: '#f59e0b' },
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
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} strokeWidth={1.5} /> Attendance Summary
            </h3>
            {attendanceWarnings.length > 0 && (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} strokeWidth={2} /> {attendanceWarnings.length} Low
              </span>
            )}
          </div>
          {attendanceDetails.length === 0 ? (
            <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No attendance records found</p>
          ) : (
            attendanceDetails.map((item, i) => {
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
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Admin / Faculty Dashboard
function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading Dashboard...</div>;
  }

  const { totalStudents = 0, totalFaculty = 0, totalClasses = 0, averageAttendance = 0, recentMarks = [], recentNotices = [] } = stats || {};

  const cards = [
    { label: 'Total Students', value: totalStudents, icon: <GraduationCap size={24} strokeWidth={1.5} />, color: '#e8f4fd' },
    { label: 'Total Faculty', value: totalFaculty, icon: <Users size={24} strokeWidth={1.5} />, color: '#d1fae5' },
    { label: 'Total Classes', value: totalClasses, icon: <School size={24} strokeWidth={1.5} />, color: '#ede9fe' },
    { label: 'Avg Attendance', value: `${averageAttendance}%`, icon: <Calendar size={24} strokeWidth={1.5} />, color: '#fef3c7' },
  ];

  return (
    <div className="fade-in-up">
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #155fa0, #8b5cf6)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {user?.name}
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>
            Managing {totalStudents} students across {totalClasses} classes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {cards.map((s, i) => (
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
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={20} strokeWidth={1.5} /> Recent Marks Uploaded
            </h3>
          </div>
          <div className="table-wrapper">
            {recentMarks.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No marks uploaded yet</p>
            ) : (
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
                  {recentMarks.map((r, i) => {
                    const grade = r.marks >= 90 ? 'A+' : r.marks >= 80 ? 'A' : r.marks >= 70 ? 'B+' : r.marks >= 60 ? 'B' : r.marks >= 50 ? 'C' : 'D';
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar avatar-primary" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                              {r.student?.name ? r.student.name.split(' ').map(n => n[0]).join('') : '?'}
                            </div>
                            {r.student?.name || 'Unknown'}
                          </div>
                        </td>
                        <td>{r.subject?.name || 'N/A'}</td>
                        <td><span className="badge badge-primary">{r.examType}</span></td>
                        <td><strong>{r.marks}</strong>/100</td>
                        <td><span className={`badge ${r.marks >= 50 ? 'badge-success' : 'badge-danger'}`}>{grade}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={20} strokeWidth={1.5} /> Recent Notices
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentNotices.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No notices posted yet</p>
            ) : (
              recentNotices.map((n, i) => {
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
              })
            )}
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
