import React, { useState, useEffect } from 'react';
import { getDefaulters, getClassSummary, getSubjects } from '../../utils/api';

export default function AdminReports() {
  const [tab, setTab] = useState('defaulters');
  const [subjects, setSubjects] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ subjectId: '', threshold: 75 });

  useEffect(() => { getSubjects({ role: 'admin' }).then(r => setSubjects(r.data.subjects)); }, []);

  useEffect(() => {
    if (tab === 'defaulters') {
      setLoading(true);
      getDefaulters({ threshold: filters.threshold, subjectId: filters.subjectId || undefined })
        .then(r => setDefaulters(r.data.defaulters))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getClassSummary({ subjectId: filters.subjectId || undefined })
        .then(r => setClassSummary(r.data.summary))
        .finally(() => setLoading(false));
    }
  }, [tab, filters]);

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'var(--success)';
    if (pct >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Attendance analysis and defaulter tracking</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'defaulters', label: '⚠️ Attendance Defaulters' },
          { id: 'class', label: '📋 Class Summary' },
        ].map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Subject</label>
            <select className="form-control" value={filters.subjectId} onChange={e => setFilters(f => ({ ...f, subjectId: e.target.value }))}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          {tab === 'defaulters' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Threshold (%)</label>
              <input type="number" className="form-control" value={filters.threshold} min={0} max={100}
                onChange={e => setFilters(f => ({ ...f, threshold: e.target.value }))} />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : tab === 'defaulters' ? (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {defaulters.length} student{defaulters.length !== 1 ? 's' : ''} below {filters.threshold}% attendance
            </span>
            {defaulters.length > 0 && (
              <span className="badge badge-danger">Action Required</span>
            )}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Subject</th>
                  <th>Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {defaulters.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.student?.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.student?.rollNumber}</td>
                    <td>{d.subject?.name} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({d.subject?.code})</span></td>
                    <td>{d.totalClasses}</td>
                    <td style={{ color: 'var(--success)' }}>{d.present}</td>
                    <td style={{ color: 'var(--danger)' }}>{d.totalClasses - d.present}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${d.percentage.toFixed(0)}%`, height: '100%', background: getPercentageColor(d.percentage), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: getPercentageColor(d.percentage), minWidth: 42 }}>
                          {d.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {defaulters.length === 0 && (
                  <tr><td colSpan={7}><div className="empty-state"><h3>No defaulters found</h3><p>All students are above the threshold</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Total Students</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {classSummary.map((s, i) => {
                const rate = s.totalStudents > 0 ? ((s.present / s.totalStudents) * 100).toFixed(1) : 0;
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>{new Date(s._id?.date).toLocaleDateString('en-IN')}</td>
                    <td>{s.subject?.name} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({s.subject?.code})</span></td>
                    <td>{s.totalStudents}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{s.present}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{s.absent}</td>
                    <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{s.late}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: getPercentageColor(parseFloat(rate)) }}>{rate}%</span>
                    </td>
                  </tr>
                );
              })}
              {classSummary.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><h3>No data available</h3></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
