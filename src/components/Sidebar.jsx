import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/requests', label: 'Requests' },
    { path: '/departments', label: 'Departments' },
    { path: '/series', label: 'Series' },
    { path: '/specifics', label: 'Specifics' },
    { path: '/users', label: 'Users' },
    { path: '/audit-logs', label: 'Audit Logs' },
    { path: '/agency-forms', label: 'Agency Forms' },
  ];

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>MRMS</h2>

      <nav style={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? '#2563eb' : 'transparent',
              color: isActive ? '#fff' : '#d1d5db',
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#111827',
    color: '#fff',
    padding: '20px',
  },
  logo: {
    margin: '0 0 24px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
  },
};

export default Sidebar;