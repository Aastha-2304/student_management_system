import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Building, Phone, Shield, CreditCard } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handlePwdChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/updatepassword', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password updated successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  const ROLE_COLORS = { admin: '#8b5cf6', faculty: '#3b82f6', student: '#10b981' };
  const roleColor = ROLE_COLORS[user?.role] || '#3b82f6';

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:'1px solid #1a2235' }}>
      <div style={{ width:36, height:36, background:`${roleColor}22`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color={roleColor} />
      </div>
      <div>
        <div style={{ fontSize:12, color:'#475569', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:500, color:'#f1f5f9' }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>My Profile</h1>
        <p style={{ color:'#64748b', fontSize:15 }}>View your account details and manage settings</p>
      </div>

      {/* Profile header */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:28, marginBottom:20, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, background:roleColor, borderRadius:'50%', opacity:0.06 }} />
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          <div style={{ width:72, height:72, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'white', fontFamily:'Syne', boxShadow:`0 0 30px ${roleColor}44` }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:22, fontWeight:800, color:'#f1f5f9', marginBottom:4 }}>{user?.name}</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:8 }}>{user?.email}</p>
            <span style={{ background:`${roleColor}22`, color: roleColor, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, textTransform:'capitalize' }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:'8px 24px 4px', marginBottom:20 }}>
        <h3 style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, color:'#f1f5f9', padding:'20px 0 8px' }}>Account Information</h3>
        <InfoRow icon={User} label="Full Name" value={user?.name} />
        <InfoRow icon={Building} label="Department" value={user?.department} />
        {user?.rollNumber && <InfoRow icon={CreditCard} label="Roll Number" value={user?.rollNumber} />}
        {user?.employeeId && <InfoRow icon={CreditCard} label="Employee ID" value={user?.employeeId} />}
        {user?.semester && <InfoRow icon={CreditCard} label="Semester" value={`Semester ${user.semester}`} />}
        {user?.phone && <InfoRow icon={Phone} label="Phone" value={user.phone} />}
        <InfoRow icon={Shield} label="Account Status" value={user?.isActive ? '✓ Active' : '✗ Deactivated'} />
        <div style={{ height:8 }} />
      </div>

      {/* Change password */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <Lock size={18} color={roleColor} />
          <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#f1f5f9' }}>Change Password</h3>
        </div>
        <form onSubmit={handlePwdChange}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Current Password</label>
              <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} required placeholder="••••••••" style={{ background:'#0d1526', borderRadius:10 }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>New Password</label>
              <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} required placeholder="Min. 6 characters" style={{ background:'#0d1526', borderRadius:10 }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Confirm New Password</label>
              <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))} required placeholder="Repeat new password" style={{ background:'#0d1526', borderRadius:10 }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding:'12px', background:`linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
