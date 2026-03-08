import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, BookOpen } from 'lucide-react';

const STATUS_COLORS = { present: '#10b981', absent: '#ef4444', late: '#f59e0b', excused: '#3b82f6' };

export default function Attendance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes] = await Promise.all([api.get('/courses')]);
      setCourses(coursesRes.data.courses);
      
      if (user.role === 'student') {
        const summaryRes = await api.get(`/attendance/summary/${user._id}`);
        setSummary(summaryRes.data.summary);
      } else {
        const attRes = await api.get('/attendance');
        setAttendances(attRes.data.attendances);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAttendance = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      const res = await api.get(`/attendance?courseId=${courseId}`);
      setAttendances(res.data.attendances);
    } catch (err) {}
  };

  if (loading) return <div style={{ color:'#475569', textAlign:'center', paddingTop:60 }}>Loading attendance...</div>;

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>
          {user.role === 'student' ? 'My Attendance' : 'Attendance Records'}
        </h1>
        <p style={{ color:'#64748b', fontSize:15 }}>
          {user.role === 'student' ? 'Track your class-wise attendance' : 'View all attendance records'}
        </p>
      </div>

      {/* Student view - Summary cards */}
      {user.role === 'student' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
          {summary.map(item => (
            <div key={item.course._id} style={{ background:'#111827', border:`1px solid ${item.isShortage ? '#ef444433' : '#1e2d45'}`, borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
              {item.isShortage && (
                <div style={{ position:'absolute', top:0, right:0, background:'#ef4444', padding:'4px 12px', borderRadius:'0 16px 0 12px', fontSize:11, fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:4 }}>
                  <AlertTriangle size={10} /> SHORTAGE
                </div>
              )}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <h3 style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:4 }}>{item.course.name}</h3>
                  <span style={{ fontSize:12, color:'#475569', background:'#1a2235', padding:'2px 8px', borderRadius:4 }}>{item.course.code}</span>
                </div>
                <div style={{ width:52, height:52, position:'relative' }}>
                  <PieChart width={52} height={52}>
                    <Pie data={[
                      { value: item.percentage },
                      { value: 100 - item.percentage }
                    ]} cx={22} cy={22} innerRadius={16} outerRadius={24} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill={item.isShortage ? '#ef4444' : '#10b981'} />
                      <Cell fill="#1a2235" />
                    </Pie>
                  </PieChart>
                </div>
              </div>
              
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {[
                  { label:'Present', value: item.present, color:'#10b981' },
                  { label:'Absent', value: item.absent, color:'#ef4444' },
                  { label:'Late', value: item.late, color:'#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ flex:1, background:'#0d1526', borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:800, fontFamily:'Syne', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:'#475569' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:'#64748b', fontSize:13 }}>Total: {item.totalClasses} classes</span>
                <span style={{ fontFamily:'Syne', fontSize:18, fontWeight:800, color: item.isShortage ? '#ef4444' : '#10b981' }}>{item.percentage}%</span>
              </div>
              
              <div style={{ height:6, background:'#1a2235', borderRadius:3, marginTop:10, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${item.percentage}%`, background: item.isShortage ? '#ef4444' : '#10b981', borderRadius:3, transition:'width 0.5s ease' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:10, color:'#334155' }}>0%</span>
                <span style={{ fontSize:10, color:'#334155' }}>75% (Min)</span>
                <span style={{ fontSize:10, color:'#334155' }}>100%</span>
              </div>
            </div>
          ))}
          {summary.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px', color:'#475569' }}>
              <BookOpen size={40} style={{ opacity:0.3, marginBottom:12 }} />
              <p>No attendance data available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Faculty/Admin view */}
      {user.role !== 'student' && (
        <>
          <div style={{ marginBottom:20 }}>
            <select value={selectedCourse} onChange={e => fetchCourseAttendance(e.target.value)} style={{ maxWidth:300, background:'#111827', border:'1px solid #1e2d45' }}>
              <option value="">-- Select a Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1a2235', background:'#0d1526' }}>
                  {['Date', 'Course', 'Faculty', 'Present', 'Absent', 'Late', 'Total', 'Topic'].map(h => (
                    <th key={h} style={{ padding:'14px 16px', textAlign:'left', fontSize:12, fontWeight:700, color:'#475569', letterSpacing:'0.5px', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendances.map(att => {
                  const present = att.records.filter(r => r.status === 'present').length;
                  const absent = att.records.filter(r => r.status === 'absent').length;
                  const late = att.records.filter(r => r.status === 'late').length;
                  return (
                    <tr key={att._id} style={{ borderBottom:'1px solid #0f1a2e' }}>
                      <td style={{ padding:'13px 16px', fontSize:13, color:'#94a3b8' }}>{new Date(att.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                      <td style={{ padding:'13px 16px', fontSize:13, color:'#f1f5f9', fontWeight:500 }}>{att.course?.code}</td>
                      <td style={{ padding:'13px 16px', fontSize:13, color:'#64748b' }}>{att.faculty?.name}</td>
                      <td style={{ padding:'13px 16px' }}><span style={{ background:'#10b98122', color:'#10b981', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{present}</span></td>
                      <td style={{ padding:'13px 16px' }}><span style={{ background:'#ef444422', color:'#ef4444', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{absent}</span></td>
                      <td style={{ padding:'13px 16px' }}><span style={{ background:'#f59e0b22', color:'#f59e0b', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{late}</span></td>
                      <td style={{ padding:'13px 16px', fontSize:13, color:'#64748b' }}>{att.records.length}</td>
                      <td style={{ padding:'13px 16px', fontSize:13, color:'#475569', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{att.topic || '—'}</td>
                    </tr>
                  );
                })}
                {attendances.length === 0 && (
                  <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'#334155' }}>No attendance records found. {!selectedCourse && 'Select a course to filter.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
