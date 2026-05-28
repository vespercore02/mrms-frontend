import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyForm = {
  SpecificName: '',
  RetentionPeriod: '',
  SeriesID: '',
};

const Specifics = () => {
  const [specifics, setSpecifics] = useState([]);
  const [seriesList, setSeriesList] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosClient.get('/series', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        setSeriesList(response.data.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load series');
      } finally {
        setLoadingSeries(false);
      }
    };

    fetchSeries();
  }, []);

  useEffect(() => {
    const fetchSpecifics = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get('/specifics', {
          params: {
            page,
            limit,
            search: submittedSearch,
            seriesId: seriesFilter,
          },
        });

        const result = response.data.data;

        setSpecifics(result.data || []);
        setMeta(result);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load specifics');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecifics();
  }, [page, limit, submittedSearch, seriesFilter, refreshKey]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleSeriesFilter = (e) => {
    setSeriesFilter(e.target.value);
    setPage(1);
  };

  const handleEdit = (specific) => {
    setEditingId(specific.SpecificID);

    setForm({
      SpecificName: specific.SpecificName || '',
      RetentionPeriod: specific.RetentionPeriod || '',
      SeriesID: specific.SeriesID || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        SpecificName: form.SpecificName,
        RetentionPeriod: form.RetentionPeriod,
        SeriesID: Number(form.SeriesID),
      };

      if (editingId) {
        await axiosClient.put(`/specifics/${editingId}`, payload);
        setSuccess('Specific record updated successfully.');
      } else {
        await axiosClient.post('/specifics', payload);
        setSuccess('Specific record created successfully.');
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save specific record'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (specificId) => {
    const confirmed = window.confirm('Delete this specific record?');

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axiosClient.delete(`/specifics/${specificId}`);

      setSuccess('Specific record deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete specific record'
      );
    }
  };

  return (
    <div>
      <h1>Specific Records</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>
            {editingId ? 'Edit Specific Record' : 'Create Specific Record'}
          </h2>

          <form onSubmit={handleSubmit}>
            <label>Specific Name</label>
            <input
              name="SpecificName"
              value={form.SpecificName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Office Memoranda"
              required
            />

            <label>Retention Period</label>
            <input
              name="RetentionPeriod"
              value={form.RetentionPeriod}
              onChange={handleChange}
              style={styles.input}
              placeholder="5 years"
              required
            />

            <label>Series</label>
            <select
              name="SeriesID"
              value={form.SeriesID}
              onChange={handleChange}
              style={styles.input}
              disabled={loadingSeries}
              required
            >
              <option value="">
                {loadingSeries ? 'Loading series...' : 'Select series'}
              </option>

              {seriesList.map((series) => (
                <option key={series.SeriesID} value={series.SeriesID}>
                  {series.ItemNoID} - {series.SeriesName}
                </option>
              ))}
            </select>

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
          <div style={styles.header}>
            <h2>Specific Records List</h2>

            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
                placeholder="Search specific..."
              />

              <select
                value={seriesFilter}
                onChange={handleSeriesFilter}
                style={styles.searchInput}
              >
                <option value="">All Series</option>
                {seriesList.map((series) => (
                  <option key={series.SeriesID} value={series.SeriesID}>
                    {series.ItemNoID} - {series.SeriesName}
                  </option>
                ))}
              </select>

              <button type="submit" style={styles.button}>
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading specifics...</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Specific Name</th>
                      <th style={styles.th}>Retention</th>
                      <th style={styles.th}>Series</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {specifics.length === 0 ? (
                      <tr>
                        <td style={styles.td} colSpan="4">
                          No specific records found.
                        </td>
                      </tr>
                    ) : (
                      specifics.map((specific) => (
                        <tr key={specific.SpecificID}>
                          <td style={styles.td}>{specific.SpecificName}</td>
                          <td style={styles.td}>{specific.RetentionPeriod}</td>
                          <td style={styles.td}>
                            {specific.Series
                              ? `${specific.Series.ItemNoID} - ${specific.Series.SeriesName}`
                              : '-'}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleEdit(specific)}
                              style={styles.smallButton}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(specific.SpecificID)
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

              <div style={styles.pagination}>
                <button
                  style={styles.pageButton}
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {meta?.currentPage || 1} of {meta?.totalPages || 1}
                </span>

                <button
                  style={styles.pageButton}
                  disabled={page >= (meta?.totalPages || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    margin: '6px 0 14px',
  },
  searchInput: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
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
    marginTop: '16px',
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
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
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

export default Specifics;