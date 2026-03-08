import React, { useState, useEffect } from 'react';
import { getAttendance, getSubjects, lockAttendance } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AttendanceHistory() {
  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subjectId: '', startDate: '', endDate: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { getSubjects({}).then(r => setSubjects(r.data.subjects)); }, []);

  useEffect(() => { fetchAttendance(); }, [filters]);

  const fetchAttendance = () => {
    setLoading(true);
    getAttendance({ subjectId: filters.subjectId || undefined, startDate: filters.startDate || undefined, endDate: filters.endDate || undefined })
      .then(r => setAttendance(r.data.attendance))
      .finally(() => setLoading(false));
  };

  const handleLock = async (id) => {
    try {
      await lockAttendance(id);
      toast.success('Attendance locked');
      fetchAttendance();
    } catch {
      toast.error('Failed to lock');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance History</h1>
          <p>View and manage past attendance records</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subject</label>
            <select className="form-control" value={filters.subjectId} onChange={e => setFilters(f => ({ ...f, subjectId: e.target.value }))}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : attendance.length === 0 ? (
        <div className="empty-state"><h3>No attendance records found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {attendance.map(a => {
            const total = a.records.length;
            const present = a.records.filter(r => r.status === 'present' || r.status === 'late').length;
            const pct = total > 0 ? ((present / total) * 100).toFixed(0) : 0;
            const isExpanded = expanded === a._id;

            return (
              <div key={a._id} className="card" style={{ padding: 0 }}>
                <div
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                  onClick={() => setExpanded(isExpanded ? null : a._id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{a.subject?.name}</span>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>{a.subject?.code}</span>
                      <span className="badge badge-secondary" style={{ fontSize: 10, textTransform: 'capitalize' }}>{a.classType}</span>
                      {a.isLocked && <span className="badge badge-danger" style={{ fontSize: 10 }}>🔒 Locked</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(a.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {a.startTime && ` · ${a.startTime}–${a.endTime}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', align: 'center', gap: 16, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: pct >= 75 ? 'var(--success)' : 'var(--warning)' }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{present}/{total}</div>
                    </div>
                    {!a.isLocked && (
                      <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); handleLock(a._id); }}>
                        🔒 Lock
                      </button>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                      {a.records.map(r => (
                        <div key={r._id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: 'var(--bg)',
                          borderRadius: 8, border: '1px solid var(--border)'
                        }}>
                          <div className="avatar avatar-sm">{r.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.student?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.student?.rollNumber}</div>
                          </div>
                          <span className={`badge badge-${r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : r.status === 'late' ? 'warning' : 'info'}`} style={{ fontSize: 10 }}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
