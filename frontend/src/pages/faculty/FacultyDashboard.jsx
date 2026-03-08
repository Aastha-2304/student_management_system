import React, { useState, useEffect } from 'react';
import { getSubjects, getAttendance, getPendingLeaves, getAttendanceStats } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSubjects({}),
      getAttendance({}),
      getPendingLeaves(),
      getAttendanceStats()
    ]).then(([subRes, attRes, leaveRes, statsRes]) => {
      setSubjects(subRes.data.subjects);
      setRecentAttendance(attRes.data.attendance.slice(0, 10));
      setPendingLeaves(leaveRes.data.leaves.slice(0, 3));
      setStats(statsRes.data.stats);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p>{user?.designation} · {user?.department?.name}</p>
        </div>
        <Link to="/faculty/mark-attendance" className="btn btn-primary">
          ✓ Mark Attendance
        </Link>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>📚</div>
            <div className="stat-content">
              <div className="label">My Subjects</div>
              <div className="value">{subjects.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✅</div>
            <div className="stat-content">
              <div className="label">Today's Classes</div>
              <div className="value">{stats.todayClasses}</div>
              <div className="sub">{stats.todayPresent} present, {stats.todayAbsent} absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>⏳</div>
            <div className="stat-content">
              <div className="label">Pending Leaves</div>
              <div className="value">{pendingLeaves.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>📊</div>
            <div className="stat-content">
              <div className="label">Attendance Rate</div>
              <div className="value">{stats.attendanceRate}%</div>
              <div className="sub">Today's average</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Subjects */}
        <div className="card">
          <div className="card-title">📚 My Subjects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subjects.map(s => (
              <div key={s._id} style={{
                padding: '12px 16px', background: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.code} · Semester {s.semester}</div>
                </div>
                <Link to="/faculty/mark-attendance" state={{ subjectId: s._id }} className="btn btn-sm btn-primary">
                  Mark
                </Link>
              </div>
            ))}
            {subjects.length === 0 && <div className="empty-state"><h3>No subjects assigned</h3></div>}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span>📋 Recent Attendance</span>
            <Link to="/faculty/attendance-history" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentAttendance.map(a => {
              const total = a.records.length;
              const present = a.records.filter(r => r.status === 'present').length;
              const pct = total > 0 ? ((present / total) * 100).toFixed(0) : 0;
              return (
                <div key={a._id} style={{
                  padding: '10px 14px', background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.subject?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 75 ? 'var(--success)' : 'var(--warning)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 60 }}>
                      {present}/{total} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
            {recentAttendance.length === 0 && <div className="empty-state"><h3>No attendance records</h3></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
