import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getSubjects, createSubject, updateSubject, getDepartments, getUsers } from '../../utils/api';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', department: '', semester: '', year: '', credits: 3, faculty: '', description: '' });

  useEffect(() => {
    fetchAll();
    getDepartments().then(r => setDepartments(r.data.departments));
    getUsers({ role: 'faculty' }).then(r => setFaculty(r.data.users));
  }, []);

  const fetchAll = () => {
    setLoading(true);
    getSubjects({}).then(r => setSubjects(r.data.subjects)).finally(() => setLoading(false));
  };

  const openModal = (s = null) => {
    setEditSubject(s);
    setForm(s ? {
      name: s.name, code: s.code, department: s.department?._id || '',
      semester: s.semester, year: s.year || '', credits: s.credits,
      faculty: s.faculty?._id || '', description: s.description || ''
    } : { name: '', code: '', department: '', semester: '', year: '', credits: 3, faculty: '', description: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSubject) {
        await updateSubject(editSubject._id, form);
        toast.success('Subject updated');
      } else {
        await createSubject(form);
        toast.success('Subject created');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Manage course subjects and assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Subject</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Credits</th>
                <th>Faculty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.description}</div>}
                  </td>
                  <td><span className="badge badge-info">{s.code}</span></td>
                  <td style={{ fontSize: 13 }}>{s.department?.name} <span style={{ color: 'var(--text-muted)' }}>({s.department?.code})</span></td>
                  <td>Sem {s.semester}</td>
                  <td>{s.credits}</td>
                  <td style={{ fontSize: 13 }}>{s.faculty?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openModal(s)}>Edit</button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><h3>No subjects yet</h3></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editSubject ? 'Edit' : 'Add'} Subject</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Subject Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject Code *</label>
                    <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="e.g. CS301" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-control" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
                      <option value="">Select...</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester *</label>
                    <select className="form-control" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} required>
                      <option value="">Select...</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <input type="number" className="form-control" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} min={1} max={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Faculty</label>
                    <select className="form-control" value={form.faculty} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}>
                      <option value="">Select Faculty</option>
                      {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
