import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDepartments, createDepartment, updateDepartment } from '../../utils/api';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = () => {
    setLoading(true);
    getDepartments().then(r => setDepartments(r.data.departments)).finally(() => setLoading(false));
  };

  const openModal = (dept = null) => {
    setEditDept(dept);
    setForm(dept ? { name: dept.name, code: dept.code, description: dept.description || '' } : { name: '', code: '', description: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        await updateDepartment(editDept._id, form);
        toast.success('Department updated');
      } else {
        await createDepartment(form);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Manage college departments</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Department</button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {departments.map(d => (
            <div key={d._id} className="card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--primary-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'var(--primary)'
                }}>
                  {d.code.slice(0, 2)}
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => openModal(d)}>Edit</button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{d.description || 'No description'}</div>
              <div style={{ fontSize: 12 }}>
                <span className="badge badge-info">{d.code}</span>
              </div>
            </div>
          ))}
          {departments.length === 0 && <div className="empty-state"><h3>No departments yet</h3></div>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editDept ? 'Edit' : 'Add'} Department</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Code *</label>
                  <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="e.g. CSE" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
