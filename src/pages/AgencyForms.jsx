import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyForm = {
  AgencyUniqueID: '',
  AgencyName: '',
  AgencyAddress: '',
  AgencyContact: '',
  AgencyDate: '',
};

const AgencyForms = () => {
  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/agency-forms');

        setAgencies(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agency forms');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
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

  const handleEdit = (agency) => {
    setEditingId(agency.AgencyUniqueID);

    setForm({
      AgencyUniqueID: agency.AgencyUniqueID || '',
      AgencyName: agency.AgencyName || '',
      AgencyAddress: agency.AgencyAddress || '',
      AgencyContact: agency.AgencyContact || '',
      AgencyDate: agency.AgencyDate || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await axiosClient.put(`/agency-forms/${editingId}`, form);
        setSuccess('Agency form updated successfully.');
      } else {
        await axiosClient.post('/agency-forms', form);
        setSuccess('Agency form created successfully.');
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save agency form');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (agencyId) => {
    const confirmed = window.confirm(
      'Delete this agency form? This may affect related requests/files.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axiosClient.delete(`/agency-forms/${agencyId}`);

      setSuccess('Agency form deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete agency form');
    }
  };

  return (
    <div>
      <h1>Agency Forms</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>{editingId ? 'Edit Agency Form' : 'Create Agency Form'}</h2>

          <form onSubmit={handleSubmit}>
            <label>Agency Unique ID</label>
            <input
              name="AgencyUniqueID"
              value={form.AgencyUniqueID}
              onChange={handleChange}
              style={styles.input}
              placeholder="AGY-001"
              disabled={!!editingId}
              required
            />

            <label>Agency Name</label>
            <input
              name="AgencyName"
              value={form.AgencyName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Sample Government Office"
              required
            />

            <label>Agency Address</label>
            <input
              name="AgencyAddress"
              value={form.AgencyAddress}
              onChange={handleChange}
              style={styles.input}
              placeholder="Muntinlupa City"
            />

            <label>Agency Contact</label>
            <input
              name="AgencyContact"
              value={form.AgencyContact}
              onChange={handleChange}
              style={styles.input}
              placeholder="09123456789"
            />

            <label>Agency Date</label>
            <input
              name="AgencyDate"
              value={form.AgencyDate}
              onChange={handleChange}
              style={styles.input}
              placeholder="2026-05-21"
            />

            <div style={styles.actions}>
              <button type="submit" disabled={saving} style={styles.button}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Agency List</h2>

          {loading ? (
            <p>Loading agencies...</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Agency</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {agencies.length === 0 ? (
                    <tr>
                      <td style={styles.td} colSpan="5">
                        No agency forms found.
                      </td>
                    </tr>
                  ) : (
                    agencies.map((agency) => (
                      <tr key={agency.AgencyUniqueID}>
                        <td style={styles.td}>{agency.AgencyUniqueID}</td>
                        <td style={styles.td}>
                          <strong>{agency.AgencyName}</strong>
                          <br />
                          <span style={styles.muted}>
                            {agency.AgencyAddress || '-'}
                          </span>
                        </td>
                        <td style={styles.td}>{agency.AgencyContact || '-'}</td>
                        <td style={styles.td}>{agency.AgencyDate || '-'}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleEdit(agency)}
                            style={styles.smallButton}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(agency.AgencyUniqueID)
                            }
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
    verticalAlign: 'top',
  },
  muted: {
    color: '#6b7280',
    fontSize: '12px',
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

export default AgencyForms;