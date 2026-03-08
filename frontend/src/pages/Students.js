import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, Search, Users, Mail, Phone, Building } from 'lucide-react';

const ROLES = ['student', 'faculty'];
const DEPTS = ['Computer Science','Mathematics','Physics','Chemistry','Electronics','English','Administration'];

const Modal = ({ onClose, children }) => (
  <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)' }} />
    <div style={{ position:'relative', width:'100%', maxWidth:540, background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:32, boxShadow:'0 25px 60px rgba(0,0,0,0.6)', maxHeight:'90vh', overflowY:'auto' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'transparent', border:'none', color:'#475569', cursor:'pointer' }}><X size={20} /></button>
      {children}
    </div>
  </div>
);

const ROLE_COLORS = { student: '#10b981', faculty: '#3b82f6', admin: '#8b5cf6' };

export default function Students() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', department:'Computer Science', semester:1, rollNumber:'', employeeId:'', phone:'' });

  useEffect(() => { fetchUsers(); }, [roleFilter, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ role: roleFilter });
      if (search) params.set('search', search);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.users);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      toast.success('User created successfully!');
      setShowModal(false);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>User Management</h1>
          <p style={{ color:'#64748b', fontSize:15 }}>Manage students and faculty members</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 22px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', boxShadow:'0 0 24px #3b82f633' }}>
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, roll number..." style={{ paddingLeft:36, background:'#111827', border:'1px solid #1e2d45', borderRadius:10 }} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['student','faculty'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{ padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight: roleFilter === r ? 600 : 400, cursor:'pointer', background: roleFilter === r ? `${ROLE_COLORS[r]}22` : 'transparent', border: roleFilter === r ? `1px solid ${ROLE_COLORS[r]}44` : '1px solid #1e2d45', color: roleFilter === r ? ROLE_COLORS[r] : '#64748b', transition:'all 0.15s', textTransform:'capitalize' }}>
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1a2235', background:'#0d1526' }}>
              {['Name', 'ID', 'Department', 'Contact', 'Status', ...(user.role === 'admin' ? ['Actions'] : [])].map(h => (
                <th key={h} style={{ padding:'14px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:'#475569', letterSpacing:'0.5px', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#475569' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#475569' }}>
                <Users size={36} style={{ opacity:0.3, display:'block', margin:'0 auto 10px' }} />
                No users found
              </td></tr>
            ) : users.map(u => (
              <tr key={u._id} style={{ borderBottom:'1px solid #0f1a2e' }}>
                <td style={{ padding:'13px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, background:`${ROLE_COLORS[u.role]}22`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color: ROLE_COLORS[u.role] }}>
                      {u.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{u.name}</div>
                      <div style={{ fontSize:12, color:'#475569' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'13px 16px', fontSize:13, color:'#64748b', fontFamily:'monospace' }}>
                  {u.rollNumber || u.employeeId || '—'}
                  {u.semester && <span style={{ display:'block', fontSize:11, color:'#334155' }}>Sem {u.semester}</span>}
                </td>
                <td style={{ padding:'13px 16px', fontSize:13, color:'#94a3b8' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Building size={12} color="#475569" />
                    {u.department}
                  </div>
                </td>
                <td style={{ padding:'13px 16px', fontSize:12, color:'#475569' }}>
                  {u.phone && <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}><Phone size={11} />{u.phone}</div>}
                </td>
                <td style={{ padding:'13px 16px' }}>
                  <span style={{ background: u.isActive ? '#10b98122' : '#ef444422', color: u.isActive ? '#10b981' : '#ef4444', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {user.role === 'admin' && (
                  <td style={{ padding:'13px 16px' }}>
                    <button onClick={() => handleDeactivate(u._id)} style={{ background:'#ef444422', border:'1px solid #ef444433', borderRadius:7, color:'#ef4444', padding:'5px 12px', fontSize:12, cursor:'pointer' }}>Deactivate</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:24 }}>Add New User</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Role</label>
                <div style={{ display:'flex', gap:8 }}>
                  {ROLES.map(r => (
                    <button type="button" key={r} onClick={() => setForm(p => ({ ...p, role: r }))} style={{ flex:1, padding:'9px', borderRadius:9, border: form.role === r ? `2px solid ${ROLE_COLORS[r]}` : '2px solid #1e2d45', background: form.role === r ? `${ROLE_COLORS[r]}22` : 'transparent', color: form.role === r ? ROLE_COLORS[r] : '#64748b', fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Full Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" required style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@college.edu" required style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" required minLength={6} style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Department</label>
                  <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} style={{ background:'#0d1526', borderRadius:10 }}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                {form.role === 'student' && (
                  <div>
                    <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Semester</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: parseInt(e.target.value) }))} style={{ background:'#0d1526', borderRadius:10 }}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>{form.role === 'student' ? 'Roll Number' : 'Employee ID'}</label>
                <input value={form.role === 'student' ? form.rollNumber : form.employeeId} onChange={e => setForm(p => form.role === 'student' ? { ...p, rollNumber: e.target.value } : { ...p, employeeId: e.target.value })} placeholder={form.role === 'student' ? 'CS2024001' : 'FAC001'} style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit phone number" style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <button type="submit" style={{ padding:'12px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', marginTop:8 }}>
                Create User
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
