import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getUser, logout } from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const response = await axiosClient.get('/dashboard/summary');
      setSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={styles.page}>Loading dashboard...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>MRMS Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome, {user?.FullName} — {user?.Role?.RoleName}
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <h2>Request Summary</h2>

      <div style={styles.grid}>
        <Card title="Total Requests" value={summary?.totalRequests} />
        <Card title="Submitted" value={summary?.requestStatus?.submitted} />
        <Card title="Received" value={summary?.requestStatus?.received} />
        <Card title="Under Review" value={summary?.requestStatus?.underReview} />
        <Card title="For Compliance" value={summary?.requestStatus?.forCompliance} />
        <Card title="Approved" value={summary?.requestStatus?.approved} />
        <Card title="Completed" value={summary?.requestStatus?.completed} />
        <Card title="Archived" value={summary?.requestStatus?.archived} />
        <Card title="Rejected" value={summary?.requestStatus?.rejected} />
      </div>

      <h2>System Totals</h2>

      <div style={styles.grid}>
        <Card title="Departments" value={summary?.totals?.departments} />
        <Card title="Agencies" value={summary?.totals?.agencies} />
        <Card title="Files" value={summary?.totals?.files} />
        <Card title="Users" value={summary?.totals?.users} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value ?? 0}</h2>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '24px',
    background: '#f3f4f6',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#6b7280',
  },
  logout: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    margin: 0,
    color: '#6b7280',
  },
  cardValue: {
    margin: '8px 0 0',
    fontSize: '32px',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    marginBottom: '16px',
  },
};

export default Dashboard;