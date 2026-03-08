import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deleteUser, getDepartments, getSubjects } from '../../utils/api';

const ROLES = ['admin', 'faculty', 'student'];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    department: '', rollNumber: '', employeeId: '',
    semester: '', year: '', section: '', designation: '',
    enrolledSubjects: []
  });

  useEffect(() => {
    fetchData();
    getDepartments().then(r => setDepartments(r.data.departments));
    getSubjects().then(r => setSubjects(r.data.subjects));
  }, [filters]);

  const fetchData = () => {
    setLoading(true);
    getUsers({ role: filters.role, search: filters.search })
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'student', department: '', rollNumber: '', employeeId: '', semester: '', year: '', section: '', designation: '', enrolledSubjects: [] });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      name: u.name, email: u.email, password: '', role: u.role,
      department: u.department?._id || '', rollNumber: u.rollNumber || '',
      employeeId: u.employeeId || '', semester: u.semester || '', year: u.year || '',
      section: u.section || '', designation: u.designation || '',
      enrolledSubjects: u.enrolledSubjects?.map(s => s._id || s) || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.rollNumber) delete payload.rollNumber;
      if (!payload.employeeId) delete payload.employeeId;

      if (editUser) {
        await updateUser(editUser._id, payload);
        toast.success('User updated successfully');
      } else {
        await createUser(payload);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deactivated');
      fetchData();
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const roleColor = { admin: 'badge-danger', faculty: 'badge-info', student: 'badge-success' };

  const filteredSubjects = subjects.filter(s => !form.department || s.department?._id === form.department || s.department === form.department);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Manage Users</h1>
          <p>Add and manage students, faculty, and admins</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-row">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Filter by Role</label>
            <select className="form-control" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Name, email, roll number..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>ID/Roll No.</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge ${roleColor[u.role]}`}>{u.role}</span></td>
                  <td style={{ fontSize: 13 }}>{u.rollNumber || u.employeeId || '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.department?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state"><h3>No users found</h3></div></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editUser ? 'Edit User' : 'Create User'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password {editUser ? '(leave blank to keep)' : '*'}</label>
                    <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editUser} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-control" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  {form.role === 'student' ? (
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input className="form-control" value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Employee ID</label>
                      <input className="form-control" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} />
                    </div>
                  )}
                </div>
                {form.role === 'student' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <input type="number" className="form-control" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} min="1" max="8" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section</label>
                      <input className="form-control" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} />
                    </div>
                  </div>
                )}
                {form.role === 'faculty' && (
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editUser ? 'Update' : 'Create'} User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
