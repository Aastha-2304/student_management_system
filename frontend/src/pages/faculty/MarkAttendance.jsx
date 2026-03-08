import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSubjects, getStudentsBySubject, markAttendance } from '../../utils/api';

export default function MarkAttendance() {
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [form, setForm] = useState({
    subjectId: location.state?.subjectId || '',
    date: new Date().toISOString().split('T')[0],
    classType: 'lecture',
    startTime: '',
    endTime: '',
    semester: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSubjects({}).then(r => setSubjects(r.data.subjects));
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      setLoading(true);
      getStudentsBySubject(form.subjectId)
        .then(r => {
          setStudents(r.data.students);
          // Default all to present
          const init = {};
          r.data.students.forEach(s => { init[s._id] = 'present'; });
          setRecords(init);
        })
        .finally(() => setLoading(false));
    }
  }, [form.subjectId]);

  const setAll = (status) => {
    const newRecs = {};
    students.forEach(s => { newRecs[s._id] = status; });
    setRecords(newRecs);
  };

  const handleSubmit = async () => {
    if (!form.subjectId) return toast.error('Please select a subject');
    if (students.length === 0) return toast.error('No students found for this subject');

    const recordsArray = students.map(s => ({
      student: s._id,
      status: records[s._id] || 'absent'
    }));

    setSubmitting(true);
    try {
      await markAttendance({
        subjectId: form.subjectId,
        date: form.date,
        classType: form.classType,
        startTime: form.startTime,
        endTime: form.endTime,
        semester: form.semester,
        section: form.section,
        records: recordsArray
      });

      const presentCount = recordsArray.filter(r => r.status === 'present').length;
      toast.success(`Attendance marked! ${presentCount}/${students.length} present`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = students.reduce((acc, s) => {
    const status = records[s._id] || 'absent';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mark Attendance</h1>
          <p>Take attendance for your class</p>
        </div>
      </div>

      {/* Session Details */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">📋 Session Details</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select className="form-control" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Class Type</label>
            <select className="form-control" value={form.classType} onChange={e => setForm(f => ({ ...f, classType: e.target.value }))}>
              <option value="lecture">Lecture</option>
              <option value="lab">Lab</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input type="time" className="form-control" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input type="time" className="form-control" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <input className="form-control" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="e.g. A" />
          </div>
        </div>
      </div>

      {/* Student Attendance */}
      {form.subjectId && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="card-title" style={{ margin: 0 }}>
              👥 Students ({students.length})
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Summary pills */}
              <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <span key={status} className={`badge badge-${status === 'present' ? 'success' : status === 'absent' ? 'danger' : status === 'late' ? 'warning' : 'info'}`}>
                    {count} {status}
                  </span>
                ))}
              </div>
              <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mark all:</span>
              {['present', 'absent'].map(s => (
                <button key={s} className={`btn btn-sm status-btn ${s}`} onClick={() => setAll(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <h3>No students enrolled</h3>
              <p>No students are enrolled in this subject</p>
            </div>
          ) : (
            <div className="attendance-grid">
              {students.map((student, idx) => (
                <div key={student._id} className="attendance-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{idx + 1}</div>
                    <div className="avatar avatar-sm">{student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{student.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{student.rollNumber}</div>
                    </div>
                  </div>
                  <div className="status-buttons">
                    {['present', 'absent', 'late', 'excused'].map(status => (
                      <button
                        key={status}
                        className={`status-btn ${status} ${records[student._id] === status ? 'active' : ''}`}
                        onClick={() => setRecords(r => ({ ...r, [student._id]: status }))}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {records[student._id] && (
                      <span className={`badge badge-${records[student._id] === 'present' ? 'success' : records[student._id] === 'absent' ? 'danger' : records[student._id] === 'late' ? 'warning' : 'info'}`}>
                        {records[student._id]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {students.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{statusCounts.present || 0} Present</span>
                <span>·</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{statusCounts.absent || 0} Absent</span>
                {statusCounts.late > 0 && <><span>·</span><span style={{ color: 'var(--warning)', fontWeight: 600 }}>{statusCounts.late} Late</span></>}
              </div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : '✓ Submit Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
