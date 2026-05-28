import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyForm = {
  FullName: '',
  Email: '',
  Password: '',
  RoleID: '',
  Status: 'active',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosClient.get('/roles');
        setRoles(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get('/users');

        setUsers(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshKey]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (user) => {
    setEditingId(user.UserID);

    setForm({
      FullName: user.FullName || '',
      Email: user.Email || '',
      Password: '',
      RoleID: user.RoleID || '',
      Status: user.Status || 'active',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        FullName: form.FullName,
        Email: form.Email,
        RoleID: Number(form.RoleID),
        Status: form.Status,
      };

      if (form.Password) {
        payload.Password = form.Password;
      }

      if (editingId) {
        await axiosClient.put(`/users/${editingId}`, payload);
        setSuccess('User updated successfully.');
      } else {
        await axiosClient.post('/users', {
          ...payload,
          Password: form.Password,
        });
        setSuccess('User created successfully.');
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm('Delete this user?');

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axiosClient.delete(`/users/${userId}`);

      setSuccess('User deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <h1>Users</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>{editingId ? 'Edit User' : 'Create User'}</h2>

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              name="FullName"
              value={form.FullName}
              onChange={handleChange}
              style={styles.input}
              placeholder="System Admin"
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="Email"
              value={form.Email}
              onChange={handleChange}
              style={styles.input}
              placeholder="admin@mrms.local"
              required
            />

            <label>
              Password {editingId && <span style={styles.muted}>(leave blank if unchanged)</span>}
            </label>
            <input
              type="password"
              name="Password"
              value={form.Password}
              onChange={handleChange}
              style={styles.input}
              placeholder={editingId ? 'Optional' : 'Required'}
              required={!editingId}
            />

            <label>Role</label>
            <select
              name="RoleID"
              value={form.RoleID}
              onChange={handleChange}
              style={styles.input}
              disabled={loadingRoles}
              required
            >
              <option value="">
                {loadingRoles ? 'Loading roles...' : 'Select role'}
              </option>

              {roles.map((role) => (
                <option key={role.RoleID} value={role.RoleID}>
                  {role.RoleName}
                </option>
              ))}
            </select>

            <label>Status</label>
            <select
              name="Status"
              value={form.Status}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>

            <div style={styles.actions}>
              <button type="submit" disabled={saving} style={styles.button}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm} style={styles.cancelButton}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <h2>User List</h2>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td style={styles.td} colSpan="5">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.UserID}>
                        <td style={styles.td}>{user.FullName}</td>
                        <td style={styles.td}>{user.Email}</td>
                        <td style={styles.td}>{user.Role?.RoleName || '-'}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{user.Status}</span>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleEdit(user)} style={styles.smallButton}>
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user.UserID)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 420px) 1fr',
    gap: '16px',
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    margin: '6px 0 14px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
  },
  smallButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
    marginRight: '6px',
  },
  deleteButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    background: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  muted: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 'normal',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    marginBottom: '16px',
  },
  success: {
    padding: '12px',
    borderRadius: '8px',
    background: '#dcfce7',
    color: '#166534',
    marginBottom: '16px',
  },
};

export default Users;