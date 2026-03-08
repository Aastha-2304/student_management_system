import React, { useState, useEffect } from 'react';
import { getDashboardStats, getPendingLeaves } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '22', color }}>{icon}</div>
    <div className="stat-content">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card" style={{ padding: '10px 14px', minWidth: 140 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getPendingLeaves()])
      .then(([statsRes, leavesRes]) => {
        setStats(statsRes.data.stats);
        setPendingLeaves(leavesRes.data.leaves.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of college attendance and leave management</p>
        </div>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <StatCard icon="👥" label="Total Students" value={stats.totalStudents} sub="Active enrollments" color="#6366f1" />
            <StatCard icon="🎓" label="Faculty Members" value={stats.totalFaculty} sub="Teaching staff" color="#06b6d4" />
            <StatCard icon="📋" label="Pending Leaves" value={stats.pendingLeaves} sub="Requires review" color="#f59e0b" />
            <StatCard icon="📊" label="Today's Attendance" value={`${stats.attendanceRate}%`} 
              sub={`${stats.todayPresent} present, ${stats.todayAbsent} absent`} color="#22c55e" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card">
              <div className="card-title">📈 7-Day Attendance Trend</div>
              <div className="chart-container" style={{ height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={stats.last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short' })} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} dot={false} name="Present" />
                    <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title">📊 Daily Classes Held</div>
              <div className="chart-container" style={{ height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short' })} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🕐 Pending Leave Requests</span>
          <Link to="/admin/leaves" className="btn btn-sm btn-secondary">View All</Link>
        </div>
        {pendingLeaves.length === 0 ? (
          <div className="empty-state">
            <h3>No pending requests</h3>
            <p>All leave requests have been processed</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map(leave => (
                  <tr key={leave._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{leave.applicant?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {leave.applicant?.role} · {leave.applicant?.rollNumber || leave.applicant?.employeeId}
                      </div>
                    </td>
                    <td><span style={{ textTransform: 'capitalize' }}>{leave.leaveType}</span></td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(leave.startDate).toLocaleDateString('en-IN')} – {new Date(leave.endDate).toLocaleDateString('en-IN')}
                    </td>
                    <td>{leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}</td>
                    <td><span className="badge badge-warning">{leave.status}</span></td>
                    <td>
                      <Link to="/admin/leaves" className="btn btn-sm btn-primary">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
