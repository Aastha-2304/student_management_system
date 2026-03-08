import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, XCircle, Clock, Calendar, FileText } from 'lucide-react';

const LEAVE_TYPES = ['sick','personal','emergency','academic','vacation','other'];

const STATUS_STYLES = {
  pending: { bg:'#f59e0b22', color:'#f59e0b', label:'Pending', icon: Clock },
  approved: { bg:'#10b98122', color:'#10b981', label:'Approved', icon: CheckCircle },
  rejected: { bg:'#ef444422', color:'#ef4444', label:'Rejected', icon: XCircle },
  cancelled: { bg:'#47556922', color:'#475569', label:'Cancelled', icon: XCircle },
};

const Modal = ({ onClose, children }) => (
  <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} />
    <div style={{ position:'relative', width:'100%', maxWidth:500, background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:32, boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'transparent', border:'none', color:'#475569', cursor:'pointer' }}><X size={20} /></button>
      {children}
    </div>
  </div>
);

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showApply, setShowApply] = useState(false);
  const [reviewLeave, setReviewLeave] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType:'sick', fromDate:'', toDate:'', reason:'' });
  const [reviewForm, setReviewForm] = useState({ status:'approved', reviewRemarks:'' });

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/leaves${params}`);
      setLeaves(res.data.leaves);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave application submitted!');
      setShowApply(false);
      setForm({ leaveType:'sick', fromDate:'', toDate:'', reason:'' });
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/leaves/${reviewLeave._id}/review`, reviewForm);
      toast.success(`Leave ${reviewForm.status}`);
      setReviewLeave(null);
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to review'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  const canReview = user.role === 'admin' || user.role === 'faculty';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>Leave Management</h1>
          <p style={{ color:'#64748b', fontSize:15 }}>{canReview ? 'Review and manage leave requests' : 'Apply and track your leave requests'}</p>
        </div>
        <button onClick={() => setShowApply(true)} style={{
          display:'flex', alignItems:'center', gap:8, padding:'11px 22px',
          background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:12,
          color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', boxShadow:'0 0 24px #3b82f633'
        }}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {['all','pending','approved','rejected','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:filter === f ? 600 : 400, cursor:'pointer',
            background: filter === f ? '#3b82f622' : 'transparent',
            border: filter === f ? '1px solid #3b82f644' : '1px solid #1e2d45',
            color: filter === f ? '#3b82f6' : '#64748b', transition:'all 0.15s', textTransform:'capitalize'
          }}>{f}</button>
        ))}
      </div>

      {/* Leave list */}
      {loading ? (
        <div style={{ textAlign:'center', color:'#475569', padding:40 }}>Loading...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {leaves.map(leave => {
            const s = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const Icon = s.icon;
            const isOwn = leave.applicant?._id === user._id;
            return (
              <div key={leave._id} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div style={{ display:'flex', gap:14, flex:1 }}>
                    <div style={{ width:44, height:44, background:`${s.color}22`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={20} color={s.color} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                        <h3 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', textTransform:'capitalize' }}>{leave.leaveType} Leave</h3>
                        <span style={{ background: s.bg, color: s.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{s.label}</span>
                      </div>
                      {canReview && (
                        <p style={{ fontSize:13, color:'#3b82f6', marginBottom:4 }}>By: <strong>{leave.applicant?.name}</strong> ({leave.applicant?.role})</p>
                      )}
                      <p style={{ fontSize:13, color:'#64748b', marginBottom:6 }}>
                        <Calendar size={12} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                        {new Date(leave.fromDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} — {new Date(leave.toDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        <span style={{ marginLeft:8, color:'#475569' }}>({leave.totalDays} day{leave.totalDays > 1 ? 's' : ''})</span>
                      </p>
                      <p style={{ fontSize:13, color:'#94a3b8' }}><FileText size={12} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />{leave.reason}</p>
                      {leave.reviewRemarks && (
                        <p style={{ fontSize:12, color:'#475569', marginTop:6, padding:'6px 12px', background:'#0d1526', borderRadius:6, borderLeft:`3px solid ${s.color}` }}>
                          Review note: {leave.reviewRemarks}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {canReview && leave.status === 'pending' && (
                      <button onClick={() => { setReviewLeave(leave); setReviewForm({ status:'approved', reviewRemarks:'' }); }} style={{
                        padding:'8px 16px', background:'#3b82f622', border:'1px solid #3b82f644',
                        borderRadius:8, color:'#3b82f6', fontSize:13, fontWeight:600, cursor:'pointer'
                      }}>Review</button>
                    )}
                    {isOwn && leave.status === 'pending' && (
                      <button onClick={() => handleCancel(leave._id)} style={{
                        padding:'8px 16px', background:'#ef444422', border:'1px solid #ef444444',
                        borderRadius:8, color:'#ef4444', fontSize:13, fontWeight:600, cursor:'pointer'
                      }}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {leaves.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#475569' }}>
              <Calendar size={40} style={{ opacity:0.3, marginBottom:12 }} />
              <p>No leave requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <Modal onClose={() => setShowApply(false)}>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Apply for Leave</h2>
          <p style={{ color:'#475569', fontSize:13, marginBottom:24 }}>Submit your leave request for approval</p>
          <form onSubmit={handleApply}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Leave Type</label>
                <select value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))} style={{ background:'#0d1526', borderRadius:10 }}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t} style={{ textTransform:'capitalize' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>From Date</label>
                  <input type="date" value={form.fromDate} onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))} required style={{ background:'#0d1526', borderRadius:10 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>To Date</label>
                  <input type="date" value={form.toDate} onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))} required style={{ background:'#0d1526', borderRadius:10 }} />
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Reason *</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Describe your reason..." required rows={3} style={{ background:'#0d1526', borderRadius:10, resize:'vertical' }} />
              </div>
              <button type="submit" style={{ padding:'12px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer' }}>
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewLeave && (
        <Modal onClose={() => setReviewLeave(null)}>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Review Leave</h2>
          <div style={{ background:'#0d1526', borderRadius:10, padding:14, marginBottom:20 }}>
            <p style={{ fontSize:14, color:'#94a3b8', marginBottom:4 }}><strong style={{ color:'#f1f5f9' }}>{reviewLeave.applicant?.name}</strong> — {reviewLeave.leaveType} leave</p>
            <p style={{ fontSize:13, color:'#64748b' }}>{new Date(reviewLeave.fromDate).toLocaleDateString()} to {new Date(reviewLeave.toDate).toLocaleDateString()} ({reviewLeave.totalDays} days)</p>
            <p style={{ fontSize:13, color:'#475569', marginTop:6 }}>{reviewLeave.reason}</p>
          </div>
          <form onSubmit={handleReview}>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {['approved','rejected'].map(s => (
                <button type="button" key={s} onClick={() => setReviewForm(p => ({ ...p, status: s }))} style={{
                  flex:1, padding:'10px', borderRadius:10, border: reviewForm.status === s ? `2px solid ${s==='approved'?'#10b981':'#ef4444'}` : '2px solid #1e2d45',
                  background: reviewForm.status === s ? `${s==='approved'?'#10b981':'#ef4444'}22` : 'transparent',
                  color: s==='approved' ? '#10b981' : '#ef4444', fontSize:14, fontWeight:600, cursor:'pointer', textTransform:'capitalize'
                }}>{s}</button>
              ))}
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Remarks (optional)</label>
              <textarea value={reviewForm.reviewRemarks} onChange={e => setReviewForm(p => ({ ...p, reviewRemarks: e.target.value }))} placeholder="Add a note..." rows={2} style={{ background:'#0d1526', borderRadius:10, resize:'vertical' }} />
            </div>
            <button type="submit" style={{ width:'100%', padding:'12px', background:`linear-gradient(135deg, ${reviewForm.status==='approved'?'#10b981, #059669':'#ef4444, #dc2626'})`, border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer' }}>
              Confirm {reviewForm.status.charAt(0).toUpperCase() + reviewForm.status.slice(1)}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
