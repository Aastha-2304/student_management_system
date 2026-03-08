import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPendingLeaves, getLeaves, reviewLeave } from '../../utils/api';

const statusBadge = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
  cancelled: 'badge-secondary'
};

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewData, setReviewData] = useState({ status: '', reviewRemarks: '' });

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = () => {
    setLoading(true);
    const fn = filter === 'pending' ? getPendingLeaves : () => getLeaves({ status: filter === 'all' ? undefined : filter });
    fn().then(r => setLeaves(r.data.leaves)).finally(() => setLoading(false));
  };

  const handleReview = async () => {
    if (!reviewData.status) return toast.error('Select approve or reject');
    try {
      await reviewLeave(selectedLeave._id, reviewData);
      toast.success(`Leave ${reviewData.status} successfully`);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (err) {
      toast.error('Failed to process leave');
    }
  };

  const leaveTypeColor = {
    sick: '#ef4444', medical: '#ef4444', emergency: '#ef4444',
    casual: '#6366f1', personal: '#6366f1', study: '#06b6d4',
    maternity: '#a78bfa', paternity: '#a78bfa', other: '#9090aa'
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave Requests</h1>
          <p>Review and manage leave applications</p>
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}
            style={{ textTransform: 'capitalize' }}
          >
            {s === 'all' ? 'All Requests' : s}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{leave.applicant?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {leave.applicant?.role} · {leave.applicant?.rollNumber || leave.applicant?.employeeId || leave.applicant?.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      background: leaveTypeColor[leave.leaveType] + '22',
                      color: leaveTypeColor[leave.leaveType],
                      textTransform: 'capitalize'
                    }}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div>{new Date(leave.startDate).toLocaleDateString('en-IN')}</div>
                    <div style={{ color: 'var(--text-muted)' }}>to {new Date(leave.endDate).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{leave.totalDays}d</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {leave.reason}
                  </td>
                  <td><span className={`badge ${statusBadge[leave.status]}`}>{leave.status}</span></td>
                  <td>
                    {leave.status === 'pending' ? (
                      <button className="btn btn-sm btn-primary" onClick={() => {
                        setSelectedLeave(leave);
                        setReviewData({ status: '', reviewRemarks: '' });
                      }}>
                        Review
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {leave.reviewedBy ? `by ${leave.reviewedBy.name?.split(' ')[0]}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><h3>No {filter} leave requests</h3></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedLeave(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Review Leave Request</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLeave(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="card" style={{ marginBottom: 16, background: 'var(--bg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Applicant: </span><strong>{selectedLeave.applicant?.name}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Role: </span><strong style={{ textTransform: 'capitalize' }}>{selectedLeave.applicant?.role}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Leave Type: </span><strong style={{ textTransform: 'capitalize' }}>{selectedLeave.leaveType}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Duration: </span><strong>{selectedLeave.totalDays} day(s)</strong></div>
                  <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--text-muted)' }}>Dates: </span><strong>{new Date(selectedLeave.startDate).toLocaleDateString('en-IN')} – {new Date(selectedLeave.endDate).toLocaleDateString('en-IN')}</strong></div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                    <div style={{ marginTop: 4, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                      {selectedLeave.reason}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['approved', 'rejected'].map(s => (
                  <button
                    key={s}
                    className={`btn ${reviewData.status === s ? (s === 'approved' ? 'btn-success' : 'btn-danger') : 'btn-secondary'}`}
                    style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
                    onClick={() => setReviewData(r => ({ ...r, status: s }))}
                  >
                    {s === 'approved' ? '✓ Approve' : '✗ Reject'}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Remarks (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Add remarks for the applicant..."
                  value={reviewData.reviewRemarks}
                  onChange={e => setReviewData(r => ({ ...r, reviewRemarks: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLeave(null)}>Cancel</button>
              <button
                className={`btn ${reviewData.status === 'approved' ? 'btn-success' : reviewData.status === 'rejected' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleReview}
                disabled={!reviewData.status}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
