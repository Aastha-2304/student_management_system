import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { applyLeave, getLeaves, cancelLeave, getLeaveSummary } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const LEAVE_TYPES = ['sick', 'casual', 'medical', 'personal', 'emergency', 'study', 'maternity', 'paternity', 'other'];

const statusBadge = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', cancelled: 'badge-secondary' };

export default function FacultyLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    Promise.all([getLeaves({}), getLeaveSummary()])
      .then(([leavesRes, summaryRes]) => {
        setLeaves(leavesRes.data.leaves);
        setSummary(summaryRes.data.summary);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave(form);
      toast.success('Leave application submitted');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave application?')) return;
    try {
      await cancelLeave(id);
      toast.success('Leave cancelled');
      fetchData();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Leaves</h1>
          <p>Apply and track your leave applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' }); setShowModal(true); }}>
          + Apply Leave
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Pending', value: summary.pending || 0, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Approved', value: summary.approved || 0, color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Rejected', value: summary.rejected || 0, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Days Taken', value: summary.totalDays || 0, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: s.color + '40' }}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 24 }}>
                {s.label === 'Pending' ? '⏳' : s.label === 'Approved' ? '✅' : s.label === 'Rejected' ? '❌' : '📅'}
              </div>
              <div className="stat-content">
                <div className="label">{s.label}</div>
                <div className="value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrapper">
        {loading ? <div className="loading-state"><div className="spinner" /></div> : (
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id}>
                  <td><span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{l.leaveType}</span></td>
                  <td style={{ fontSize: 13 }}>
                    <div>{new Date(l.startDate).toLocaleDateString('en-IN')}</div>
                    <div style={{ color: 'var(--text-muted)' }}>to {new Date(l.endDate).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.totalDays}d</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-secondary)' }}>{l.reason}</td>
                  <td><span className={`badge ${statusBadge[l.status]}`}>{l.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.reviewRemarks || '—'}</td>
                  <td>
                    {l.status === 'pending' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleCancel(l._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan={7}><div className="empty-state"><h3>No leave applications</h3></div></td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Apply for Leave</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <select className="form-control" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} required>
                    {LEAVE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input type="date" className="form-control" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input type="date" className="form-control" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required min={form.startDate || new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea className="form-control" rows={4} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required placeholder="Please provide a detailed reason for the leave..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
