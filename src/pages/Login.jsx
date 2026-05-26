import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { saveAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Email: '',
    Password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', form);

      saveAuth({
        token: response.data.data.token,
        user: response.data.data.user,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>MRMS Login</h1>
        <p style={styles.subtitle}>Municipal Records Management System</p>

        {error && <div style={styles.error}>{error}</div>}

        <label>Email</label>
        <input
          type="email"
          name="Email"
          value={form.Email}
          onChange={handleChange}
          style={styles.input}
          placeholder="admin@mrms.local"
        />

        <label>Password</label>
        <input
          type="password"
          name="Password"
          value={form.Password}
          onChange={handleChange}
          style={styles.input}
          placeholder="admin123"
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
  },
  card: {
    width: '360px',
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    margin: 0,
    marginBottom: '16px',
    textAlign: 'center',
    color: '#6b7280',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
  },
  button: {
    marginTop: '12px',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
  },
  error: {
    padding: '10px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
  },
};

export default Login;