import React, { useState, useEffect } from 'react';
import { getStudentAttendance, getLeaveSummary, getSubjects } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getStudentAttendance(user._id, {}),
      getLeaveSummary()
    ]).then(([attRes, leaveRes]) => {
      setAttendanceSummary(attRes.data.summary);
      setLeaveSummary(leaveRes.data.summary);
    }).finally(() => setLoading(false));
  }, [user]);

  const overallPct = attendanceSummary.length > 0
    ? (attendanceSummary.reduce((acc, s) => acc + s.attendancePercentage, 0) / attendanceSummary.length).toFixed(1)
    : 0;

  const getColor = (pct) => {
    if (pct >= 75) return 'var(--success)';
    if (pct >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Hello, {user?.name?.split(' ')[0]}!</h1>
          <p>
            {user?.rollNumber} · {user?.department?.name} · Semester {user?.semester}
            {user?.section && ` · Section ${user?.section}`}
          </p>
        </div>
        <Link to="/student/leaves" className="btn btn-primary">+ Apply Leave</Link>
      </div>

      {/* Overall stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: getColor(overallPct) + '40' }}>
          <div className="stat-icon" style={{ background: getColor(overallPct) + '22', color: getColor(overallPct), fontSize: 24 }}>📊</div>
          <div className="stat-content">
            <div className="label">Overall Attendance</div>
            <div className="value" style={{ color: getColor(overallPct) }}>{overallPct}%</div>
            <div className="sub">{attendanceSummary.length} subjects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', fontSize: 24 }}>⏳</div>
          <div className="stat-content">
            <div className="label">Pending Leaves</div>
            <div className="value">{leaveSummary.pending || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)', fontSize: 24 }}>✅</div>
          <div className="stat-content">
            <div className="label">Approved Leaves</div>
            <div className="value">{leaveSummary.approved || 0}</div>
            <div className="sub">{leaveSummary.totalDays || 0} days taken</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: overallPct < 75 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: overallPct < 75 ? 'var(--danger)' : 'var(--success)', fontSize: 24 }}>
            {overallPct < 75 ? '⚠️' : '🎯'}
          </div>
          <div className="stat-content">
            <div className="label">Status</div>
            <div className="value" style={{ fontSize: 16, color: overallPct < 75 ? 'var(--danger)' : 'var(--success)' }}>
              {overallPct >= 75 ? 'On Track' : overallPct >= 60 ? 'At Risk' : 'Critical'}
            </div>
            <div className="sub">{overallPct >= 75 ? 'Good attendance!' : 'Below 75% required'}</div>
          </div>
        </div>
      </div>

      {/* Subject-wise attendance */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>📚 Subject-wise Attendance</span>
          <Link to="/student/attendance" className="btn btn-sm btn-secondary">Full Report</Link>
        </div>
        {attendanceSummary.length === 0 ? (
          <div className="empty-state"><h3>No attendance records yet</h3><p>Your attendance will appear once faculty marks it</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {attendanceSummary.map((s, i) => {
              const pct = s.attendancePercentage.toFixed(1);
              const color = getColor(parseFloat(pct));
              return (
                <div key={i} style={{
                  padding: '14px 16px', background: 'var(--bg)',
                  border: `1px solid ${parseFloat(pct) < 75 ? color + '44' : 'var(--border)'}`,
                  borderRadius: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.subject?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.subject?.code}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {s.present + s.late}/{s.totalClasses} classes
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar">
                        <div className={`progress-fill ${parseFloat(pct) >= 75 ? 'good' : parseFloat(pct) >= 60 ? 'warning' : 'danger'}`}
                          style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>{s.present}P</span>
                      {s.late > 0 && <span className="badge badge-warning" style={{ fontSize: 10 }}>{s.late}L</span>}
                      <span className="badge badge-danger" style={{ fontSize: 10 }}>{s.absent}A</span>
                    </div>
                  </div>
                  {parseFloat(pct) < 75 && (
                    <div style={{ marginTop: 8, fontSize: 12, color, fontWeight: 600 }}>
                      ⚠️ Need {Math.ceil((0.75 * s.totalClasses - s.present - s.late) / 0.25)} more classes to reach 75%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
