import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

const demoUsers = [
  { role: 'Admin', email: 'admin@college.edu', password: 'Admin@123', color: '#8b5cf6' },
  { role: 'Faculty', email: 'rajesh@jims.edu', password: 'Faculty@123', color: '#3b82f6' },
  { role: 'Student', email: 'arjun@student.edu', password: 'Student@123', color: '#10b981' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u) => { setEmail(u.email); setPassword(u.password); };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      {/* Background orbs */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:400, height:400, background:'#3b82f6', borderRadius:'50%', filter:'blur(120px)', opacity:0.08 }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, background:'#8b5cf6', borderRadius:'50%', filter:'blur(130px)', opacity:0.07 }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, background:'#06b6d4', borderRadius:'50%', filter:'blur(180px)', opacity:0.04 }} />

      <div style={{ width:'100%', maxWidth:440, position:'relative' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:60, height:60, background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 40px #3b82f655' }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontFamily:'Syne', fontSize:32, fontWeight:800, color:'#f1f5f9', letterSpacing:'-1px', marginBottom:8 }}>EduAttend</h1>
          <p style={{ color:'#64748b', fontSize:15 }}>Attendance & Leave Management</p>
        </div>

        {/* Card */}
        <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:36, boxShadow:'0 25px 60px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>Sign In</h2>
          <p style={{ color:'#475569', fontSize:13, marginBottom:28 }}>Access your portal</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.edu" required
                  style={{ paddingLeft:40, background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }} />
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#94a3b8', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#475569' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ paddingLeft:40, paddingRight:40, background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#475569', padding:2 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'13px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:10,
              color:'white', fontSize:15, fontWeight:600, fontFamily:'Syne', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              opacity: loading ? 0.7 : 1, transition:'all 0.2s', boxShadow:'0 0 30px #3b82f633'
            }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'#334155', fontSize:12, marginTop:24 }}>
          © 2026 EduAttend - Team AG
        </p>
      </div>
    </div>
  );
}
