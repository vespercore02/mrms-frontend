import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.navbar}>
      <div>
        <strong>{user?.FullName}</strong>
        <p style={styles.role}>{user?.Role?.RoleName}</p>
      </div>

      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>
    </header>
  );
};

const styles = {
  navbar: {
    height: '64px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
    padding: '0 24px',
  },
  role: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
  },
  button: {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '8px',
    background: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default Navbar;