import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X, BookOpen, Users, Clock, Layers } from 'lucide-react';

const Modal = ({ onClose, children }) => (
  <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)' }} />
    <div style={{ position:'relative', width:'100%', maxWidth:540, background:'#111827', border:'1px solid #1e2d45', borderRadius:20, padding:32, boxShadow:'0 25px 60px rgba(0,0,0,0.6)', maxHeight:'90vh', overflowY:'auto' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'transparent', border:'none', color:'#475569', cursor:'pointer' }}><X size={20} /></button>
      {children}
    </div>
  </div>
);

const DEPT_COLORS = { 'Computer Science': '#3b82f6', 'Mathematics': '#8b5cf6', 'Physics': '#06b6d4', 'Chemistry': '#10b981', 'default': '#f59e0b' };

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({ name:'', code:'', department:'Computer Science', semester:1, credits:3, faculty:'' });

  useEffect(() => {
    fetchCourses();
    if (user.role === 'admin') api.get('/users?role=faculty').then(r => setFaculties(r.data.users));
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', form);
      toast.success('Course created!');
      setShowModal(false);
      setForm({ name:'', code:'', department:'Computer Science', semester:1, credits:3, faculty:'' });
      fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deptColor = (dept) => DEPT_COLORS[dept] || DEPT_COLORS.default;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>
            {user.role === 'student' ? 'My Courses' : user.role === 'faculty' ? 'Teaching Courses' : 'All Courses'}
          </h1>
          <p style={{ color:'#64748b', fontSize:15 }}>{courses.length} active course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 22px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', boxShadow:'0 0 24px #3b82f633' }}>
            <Plus size={16} /> Add Course
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'#475569', padding:40 }}>Loading courses...</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {courses.map(course => {
            const color = deptColor(course.department);
            return (
              <div key={course._id} style={{ background:'#111827', border:'1px solid #1e2d45', borderRadius:16, padding:24, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${color}, ${color}88)` }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ background:`${color}22`, border:`1px solid ${color}33`, borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:700, color, fontFamily:'monospace' }}>{course.code}</div>
                  <div style={{ background:'#1a2235', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#475569' }}>Sem {course.semester}</div>
                </div>
                <h3 style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, color:'#f1f5f9', marginBottom:6 }}>{course.name}</h3>
                <p style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>{course.department}</p>
                
                <div style={{ display:'flex', gap:16, marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b' }}>
                    <Users size={13} color={color} />
                    <span>{course.students?.length || 0} students</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b' }}>
                    <Layers size={13} color={color} />
                    <span>{course.credits} credits</span>
                  </div>
                </div>

                {course.faculty && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0d1526', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ width:26, height:26, background:`${color}22`, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color }}>
                      {course.faculty?.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#94a3b8' }}>{course.faculty?.name}</div>
                      <div style={{ fontSize:11, color:'#334155' }}>Faculty</div>
                    </div>
                  </div>
                )}

                {course.schedule?.length > 0 && (
                  <div style={{ marginTop:12 }}>
                    {course.schedule.map((s, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#475569', marginTop:4 }}>
                        <Clock size={11} color="#334155" />
                        <span>{s.day} • {s.startTime}–{s.endTime} • {s.room}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {courses.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 20px', color:'#475569' }}>
              <BookOpen size={40} style={{ opacity:0.3, marginBottom:12 }} />
              <p>No courses available</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ fontFamily:'Syne', fontSize:20, fontWeight:700, color:'#f1f5f9', marginBottom:24 }}>Create New Course</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Course Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Data Structures & Algorithms" required style={{ background:'#0d1526', borderRadius:10 }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Course Code *</label>
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="CS301" required style={{ background:'#0d1526', borderRadius:10 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Credits</label>
                  <input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: parseInt(e.target.value) }))} min={1} max={6} style={{ background:'#0d1526', borderRadius:10 }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Department</label>
                  <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} style={{ background:'#0d1526', borderRadius:10 }}>
                    {['Computer Science','Mathematics','Physics','Chemistry','Electronics','English'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Semester</label>
                  <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: parseInt(e.target.value) }))} style={{ background:'#0d1526', borderRadius:10 }}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:13, color:'#64748b', marginBottom:7 }}>Assign Faculty</label>
                <select value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: e.target.value }))} style={{ background:'#0d1526', borderRadius:10 }}>
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                </select>
              </div>
              <button type="submit" style={{ padding:'12px', background:'linear-gradient(135deg, #3b82f6, #8b5cf6)', border:'none', borderRadius:10, color:'white', fontSize:14, fontWeight:600, fontFamily:'Syne', cursor:'pointer', marginTop:8 }}>
                Create Course
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
