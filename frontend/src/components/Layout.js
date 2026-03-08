import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, ClipboardList, 
  CalendarDays, BarChart3, LogOut, Menu, X, User,
  ClipboardCheck, ChevronRight
} from 'lucide-react';

const navItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/students', icon: Users, label: 'Users' },
    { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { to: '/leaves', icon: CalendarDays, label: 'Leave Requests' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ],
  faculty: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/attendance/mark', icon: ClipboardCheck, label: 'Mark Attendance' },
    { to: '/attendance', icon: ClipboardList, label: 'View Attendance' },
    { to: '/leaves', icon: CalendarDays, label: 'Leave Requests' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/attendance', icon: ClipboardList, label: 'My Attendance' },
    { to: '/leaves', icon: CalendarDays, label: 'My Leaves' },
  ],
};

const roleColors = { admin: '#8b5cf6', faculty: '#3b82f6', student: '#10b981' };
const roleBadge = { admin: 'Administrator', faculty: 'Faculty', student: 'Student' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = navItems[user?.role] || [];
  const roleColor = roleColors[user?.role];

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile }) => (
    <div style={{
      width: mobile ? '100%' : 260,
      background: '#0d1526',
      borderRight: '1px solid #1e2d45',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Accent glow */}
      <div style={{ position:'absolute', top:-60, left:-60, width:200, height:200, background: roleColor, borderRadius:'50%', filter:'blur(80px)', opacity:0.12, pointerEvents:'none' }} />
      
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #1a2235' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, fontFamily:'Syne', color:'white', boxShadow:`0 0 20px ${roleColor}44` }}>E</div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:'Syne', letterSpacing:'-0.5px', color:'#f1f5f9' }}>EduAttend</div>
            <div style={{ fontSize:11, color: roleColor, fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase' }}>{roleBadge[user?.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'16px 12px', overflowY:'auto' }}>
        <div style={{ fontSize:11, color:'#334155', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', padding:'0 12px', marginBottom:8 }}>Navigation</div>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:10, marginBottom:4,
            color: isActive ? 'white' : '#64748b',
            background: isActive ? `linear-gradient(135deg, ${roleColor}22, ${roleColor}11)` : 'transparent',
            borderLeft: isActive ? `3px solid ${roleColor}` : '3px solid transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: 14,
            transition: 'all 0.15s',
            textDecoration: 'none'
          })}>
            <Icon size={17} />
            <span>{label}</span>
            {({ isActive }) => isActive && <ChevronRight size={14} style={{ marginLeft:'auto', opacity:0.5 }} />}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding:'16px 16px 24px', borderTop:'1px solid #1a2235' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'#111827', marginBottom:8 }}>
          <div style={{ width:34, height:34, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={() => { navigate('/profile'); setSidebarOpen(false); }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'transparent', border:'none', color:'#475569', borderRadius:8, fontSize:13, marginBottom:4, textAlign:'left', transition:'all 0.15s' }}
          onMouseEnter={e => { e.target.style.background='#111827'; e.target.style.color='#94a3b8'; }}
          onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='#475569'; }}>
          <User size={15} /> Profile
        </button>
        <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'transparent', border:'none', color:'#475569', borderRadius:8, fontSize:13, textAlign:'left', transition:'all 0.15s' }}
          onMouseEnter={e => { e.target.style.background='#1a0a0a'; e.target.style.color='#ef4444'; }}
          onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='#475569'; }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ display: window.innerWidth < 768 ? 'none' : 'flex', flexShrink:0, height:'100%' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position:'relative', width:280, height:'100%', zIndex:1 }}>
            <Sidebar mobile />
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ position:'absolute', top:16, right:16, background:'transparent', border:'none', color:'white', zIndex:2 }}>
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar (mobile) */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:'#0d1526', borderBottom:'1px solid #1e2d45', flexShrink:0 }} className="topbar">
          <button onClick={() => setSidebarOpen(true)} style={{ background:'transparent', border:'none', color:'#64748b', padding:4 }}>
            <Menu size={22} />
          </button>
          <div style={{ fontSize:16, fontWeight:700, fontFamily:'Syne', color:'#f1f5f9' }}>EduAttend</div>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>{user?.name?.[0]?.toUpperCase()}</div>
        </div>

        <main style={{ flex:1, overflowY:'auto', padding: '32px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) { .topbar { display: none !important; } .desktop-sidebar { display: flex !important; } }
        @media (max-width: 767px) { .topbar { display: flex !important; } .desktop-sidebar { display: none !important; } main { padding: 20px !important; } }
        nav a:hover { background: #111827 !important; color: #94a3b8 !important; }
      `}</style>
    </div>
  );
}
