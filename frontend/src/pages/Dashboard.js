import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CalendarDays, AlertTriangle, ClipboardCheck, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:color, borderRadius:'50%', opacity:0.08 }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
      <div>
        <p style={{ fontSize:13, color:'#64748b', marginBottom:8, fontWeight:500 }}>{title}</p>
        <p style={{ fontSize:32, fontWeight:800, fontFamily:'Syne', color:'#f1f5f9', lineHeight:1 }}>{value}</p>
        {subtitle && <p style={{ fontSize:12, color:'#475569', marginTop:6 }}>{subtitle}</p>}
      </div>
      <div style={{ width:44, height:44, background:`${color}22`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  </div>
);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#10b981','#ef4444','#f59e0b','#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setStats(r.data.stats); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'#475569', textAlign:'center', paddingTop:60 }}>Loading dashboard...</div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const monthlyChartData = stats?.monthlyData?.map(d => ({ name: monthNames[d._id.month-1], sessions: d.count })) || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:36 }}>
        <p style={{ color:'#3b82f6', fontWeight:600, fontSize:13, letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:6 }}>{greeting()}</p>
        <h1 style={{ fontFamily:'Syne', fontSize:30, fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.5px', marginBottom:6 }}>{user?.name}</h1>
        <p style={{ color:'#64748b', fontSize:15 }}>{user?.department} • {user?.role === 'student' ? `Roll: ${user?.rollNumber}` : user?.role === 'faculty' ? `ID: ${user?.employeeId}` : 'Administrator'}</p>
      </div>

      {/* Admin Stats */}
      {user?.role === 'admin' && stats && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="#3b82f6" subtitle="Active enrollments" />
            <StatCard title="Total Faculty" value={stats.totalFaculty} icon={Users} color="#8b5cf6" subtitle="Teaching staff" />
            <StatCard title="Active Courses" value={stats.totalCourses} icon={BookOpen} color="#06b6d4" subtitle="This semester" />
            <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={AlertTriangle} color="#f59e0b" subtitle="Awaiting review" />
            <StatCard title="Today's Sessions" value={stats.todayAttendances} icon={ClipboardCheck} color="#10b981" subtitle="Marked today" />
          </div>

          {/* Charts */}
          {monthlyChartData.length > 0 && (
            <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24, marginBottom:24 }}>
              <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:20 }}>Monthly Attendance Sessions</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="name" stroke="#334155" fontSize={12} />
                  <YAxis stroke="#334155" fontSize={12} />
                  <Tooltip contentStyle={{ background:'#0d1526', border:'1px solid #1e2d45', borderRadius:8, color:'#f1f5f9', fontSize:13 }} />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pending Leaves */}
          {stats.recentLeaves?.length > 0 && (
            <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24 }}>
              <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:16 }}>Pending Leave Requests</h3>
              {stats.recentLeaves.map(leave => (
                <div key={leave._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #1a2235' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, background:'#f59e0b22', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Clock size={16} color="#f59e0b" />
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{leave.applicant?.name}</p>
                      <p style={{ fontSize:12, color:'#475569' }}>{leave.leaveType} • {leave.applicant?.role}</p>
                    </div>
                  </div>
                  <span style={{ background:'#f59e0b22', color:'#f59e0b', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:600, textTransform:'uppercase' }}>Pending</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Faculty Stats */}
      {user?.role === 'faculty' && stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
          <StatCard title="My Courses" value={stats.totalCourses} icon={BookOpen} color="#3b82f6" />
          <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="#10b981" />
          <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={AlertTriangle} color="#f59e0b" />
          <StatCard title="Today's Classes" value={stats.todayAttendances?.length || 0} icon={ClipboardCheck} color="#8b5cf6" />
        </div>
      )}

      {/* Student Stats */}
      {user?.role === 'student' && stats && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:28 }}>
            <StatCard title="Enrolled Courses" value={stats.enrolledCourses} icon={BookOpen} color="#3b82f6" />
            <StatCard title="Overall Attendance" value={`${stats.overallAttendance}%`} icon={TrendingUp} color={parseFloat(stats.overallAttendance) >= 75 ? '#10b981' : '#ef4444'} subtitle={`${stats.presentClasses}/${stats.totalClasses} classes`} />
            <StatCard title="My Leave Requests" value={stats.myLeaves} icon={CalendarDays} color="#8b5cf6" />
            <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={Clock} color="#f59e0b" />
          </div>

          {/* Attendance gauge */}
          <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24 }}>
            <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:20 }}>Attendance Overview</h3>
            <div style={{ display:'flex', alignItems:'center', gap:32 }}>
              <div style={{ position:'relative', width:140, height:140, flexShrink:0 }}>
                <PieChart width={140} height={140}>
                  <Pie data={[
                    { name:'Present', value: parseFloat(stats.overallAttendance) || 0 },
                    { name:'Absent', value: 100 - (parseFloat(stats.overallAttendance) || 0) }
                  ]} cx={65} cy={65} innerRadius={45} outerRadius={65} startAngle={90} endAngle={-270} dataKey="value">
                    <Cell fill={parseFloat(stats.overallAttendance) >= 75 ? '#10b981' : '#ef4444'} />
                    <Cell fill="#1a2235" />
                  </Pie>
                </PieChart>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:22, fontWeight:800, fontFamily:'Syne', color: parseFloat(stats.overallAttendance) >= 75 ? '#10b981' : '#ef4444' }}>{stats.overallAttendance}%</span>
                </div>
              </div>
              <div>
                <p style={{ color:'#94a3b8', fontSize:14, marginBottom:6 }}>You've attended <strong style={{ color:'#f1f5f9' }}>{stats.presentClasses}</strong> out of <strong style={{ color:'#f1f5f9' }}>{stats.totalClasses}</strong> classes</p>
                {parseFloat(stats.overallAttendance) < 75 ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#ef444422', padding:'8px 14px', borderRadius:8, marginTop:8 }}>
                    <AlertTriangle size={14} color="#ef4444" />
                    <span style={{ fontSize:13, color:'#ef4444', fontWeight:500 }}>Attendance below 75% — shortage risk!</span>
                  </div>
                ) : (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#10b98122', padding:'8px 14px', borderRadius:8, marginTop:8 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <span style={{ fontSize:13, color:'#10b981', fontWeight:500 }}>Great attendance! Keep it up.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
