import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, BookMarked, Save, Users } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: '#10b981' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: '#ef4444' },
  { value: 'late', label: 'Late', icon: Clock, color: '#f59e0b' },
  { value: 'excused', label: 'Excused', icon: BookMarked, color: '#3b82f6' },
];

export default function MarkAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('morning');
  const [topic, setTopic] = useState('');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    api.get(`/courses/${selectedCourse}`).then(r => {
      const studs = r.data.course.students || [];
      setStudents(studs);
      const init = {};
      studs.forEach(s => init[s._id] = 'present');
      setRecords(init);
    }).finally(() => setLoading(false));
  }, [selectedCourse]);

  const setAll = (status) => {
    const updated = {};
    students.forEach(s => updated[s._id] = status);
    setRecords(updated);
  };

  const handleSave = async () => {
    if (!selectedCourse) return toast.error('Please select a course');
    if (students.length === 0) return toast.error('No students in this course');
    setSaving(true);
    try {
      const recordsArr = students.map(s => ({ student: s._id, status: records[s._id] || 'absent' }));
      await api.post('/attendance', { courseId: selectedCourse, date, session, topic, records: recordsArr });
      toast.success('Attendance marked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const counts = { present: 0, absent: 0, late: 0, excused: 0 };
  Object.values(records).forEach(s => counts[s]++);

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>Mark Attendance</h1>
        <p style={{ color:'#64748b', fontSize:15 }}>Record student presence for today's session</p>
      </div>

      {/* Session config */}
      <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24, marginBottom:24 }}>
        <h3 style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:20 }}>Session Details</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16 }}>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7, fontWeight:500 }}>Course *</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7, fontWeight:500 }}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7, fontWeight:500 }}>Session</label>
            <select value={session} onChange={e => setSession(e.target.value)} style={{ background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7, fontWeight:500 }}>Topic (optional)</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Today's topic..." style={{ background:'#0d1526', border:'1px solid #1e2d45', borderRadius:10 }} />
          </div>
        </div>
      </div>

      {/* Student list */}
      {selectedCourse && (
        <>
          {/* Stats bar */}
          <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            {STATUS_OPTIONS.map(s => (
              <div key={s.value} style={{ display:'flex', alignItems:'center', gap:8, background:'#111827', border:'1px solid #1e2d45', borderRadius:10, padding:'8px 16px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: s.color }} />
                <span style={{ fontSize:13, color:'#94a3b8' }}>{s.label}:</span>
                <span style={{ fontSize:13, fontWeight:700, color: s.color }}>{counts[s.value]}</span>
              </div>
            ))}
          </div>

          {/* Bulk actions */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, color:'#64748b', alignSelf:'center', marginRight:4 }}>Mark all:</span>
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setAll(s.value)} style={{
                padding:'7px 14px', background:`${s.color}22`, border:`1px solid ${s.color}44`, borderRadius:8,
                color: s.color, fontSize:12, fontWeight:600, transition:'all 0.15s'
              }}>{s.label}</button>
            ))}
          </div>

          <div style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, overflow:'hidden', marginBottom:20 }}>
            {loading ? (
              <div style={{ padding:40, textAlign:'center', color:'#475569' }}>Loading students...</div>
            ) : students.length === 0 ? (
              <div style={{ padding:40, textAlign:'center', color:'#475569' }}>
                <Users size={36} style={{ opacity:0.3, marginBottom:10 }} />
                <p>No students enrolled in this course</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 140px auto', gap:16, padding:'13px 20px', background:'#0d1526', borderBottom:'1px solid #1a2235' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px' }}>Student</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px' }}>Roll No.</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.5px' }}>Status</span>
                </div>
                {students.map((student, i) => {
                  const status = records[student._id] || 'absent';
                  const statusInfo = STATUS_OPTIONS.find(s => s.value === status);
                  return (
                    <div key={student._id} style={{ display:'grid', gridTemplateColumns:'1fr 140px auto', gap:16, alignItems:'center', padding:'13px 20px', borderBottom: i < students.length-1 ? '1px solid #0f1a2e' : 'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, background:`${statusInfo.color}22`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color: statusInfo.color }}>
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{student.name}</div>
                          <div style={{ fontSize:12, color:'#475569' }}>{student.email}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:13, color:'#64748b', fontFamily:'monospace' }}>{student.rollNumber || '—'}</span>
                      <div style={{ display:'flex', gap:6}}>
                        {STATUS_OPTIONS.map(s => (
                          <button key={s.value} onClick={() => setRecords(p => ({ ...p, [student._id]: s.value }))} title={s.label} style={{
                            width:34, height:34, borderRadius:8, border: status === s.value ? `2px solid ${s.color}` : '2px solid transparent',
                            background: status === s.value ? `${s.color}22` : '#0d1526',
                            cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center'
                          }}>
                            <s.icon size={15} color={status === s.value ? s.color : '#334155'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            display:'flex', alignItems:'center', gap:8, padding:'13px 28px',
            background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:12,
            color:'white', fontSize:15, fontWeight:600, fontFamily:'Syne',
            opacity: saving ? 0.7 : 1, boxShadow:'0 0 30px #3b82f633', cursor:'pointer'
          }}>
            <Save size={17} />
            {saving ? 'Saving...' : `Save Attendance (${students.length} students)`}
          </button>
        </>
      )}
    </div>
  );
}
