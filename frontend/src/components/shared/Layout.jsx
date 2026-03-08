import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2" /><path d="M9 22V12h6v10" />
      <path d="M9 2v4M15 2v4M2 9h20M2 15h5M17 15h5" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ClipboardList: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  CheckSquare: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,11 12,14 22,4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const navConfig = {
  admin: [
    { label: 'Overview', items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'Dashboard' },
      { to: '/admin/reports', label: 'Reports', icon: 'BarChart' },
    ]},
    { label: 'Management', items: [
      { to: '/admin/users', label: 'Users', icon: 'Users' },
      { to: '/admin/departments', label: 'Departments', icon: 'Building' },
      { to: '/admin/subjects', label: 'Subjects', icon: 'Book' },
    ]},
    { label: 'Requests', items: [
      { to: '/admin/leaves', label: 'Leave Requests', icon: 'ClipboardList' },
    ]},
  ],
  faculty: [
    { label: 'Overview', items: [
      { to: '/faculty/dashboard', label: 'Dashboard', icon: 'Dashboard' },
    ]},
    { label: 'Attendance', items: [
      { to: '/faculty/mark-attendance', label: 'Mark Attendance', icon: 'CheckSquare' },
      { to: '/faculty/attendance-history', label: 'History', icon: 'Calendar' },
    ]},
    { label: 'Leaves', items: [
      { to: '/faculty/leaves', label: 'My Leaves', icon: 'FileText' },
    ]},
  ],
  student: [
    { label: 'Overview', items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: 'Dashboard' },
    ]},
    { label: 'Attendance', items: [
      { to: '/student/attendance', label: 'My Attendance', icon: 'Calendar' },
    ]},
    { label: 'Leaves', items: [
      { to: '/student/leaves', label: 'My Leaves', icon: 'FileText' },
    ]},
  ]
};

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sections = navConfig[user?.role] || [];

  const getPageTitle = () => {
    const path = location.pathname;
    const allItems = sections.flatMap(s => s.items);
    const current = allItems.find(i => i.to === path);
    return current?.label || 'Dashboard';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>⚡ EduTrack</h2>
          <p>Attendance Management</p>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = Icons[item.icon];
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    {Icon && <Icon />}
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name?.split(' ').slice(0, 2).join(' ')}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-link btn-ghost" onClick={handleLogout} style={{ marginTop: 4 }}>
            <Icons.LogOut />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <div>
            <div className="header-title">{getPageTitle()}</div>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
