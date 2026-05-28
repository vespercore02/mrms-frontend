import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyForm = {
  ItemNoID: '',
  SeriesName: '',
  DepartmentID: '',
};

const Series = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosClient.get('/departments', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        setDepartments(response.data.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get('/series', {
          params: {
            page,
            limit,
            search: submittedSearch,
            departmentId: departmentFilter,
          },
        });

        const result = response.data.data;

        setSeriesList(result.data || []);
        setMeta(result);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load series');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [page, limit, submittedSearch, departmentFilter, refreshKey]);

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

  const handleDepartmentFilter = (e) => {
    setDepartmentFilter(e.target.value);
    setPage(1);
  };

  const handleEdit = (series) => {
    setEditingId(series.SeriesID);

    setForm({
      ItemNoID: series.ItemNoID || '',
      SeriesName: series.SeriesName || '',
      DepartmentID: series.DepartmentID || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ItemNoID: form.ItemNoID,
        SeriesName: form.SeriesName,
        DepartmentID: Number(form.DepartmentID),
      };

      if (editingId) {
        await axiosClient.put(`/series/${editingId}`, payload);
        setSuccess('Series updated successfully.');
      } else {
        await axiosClient.post('/series', payload);
        setSuccess('Series created successfully.');
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save series');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (seriesId) => {
    const confirmed = window.confirm(
      'Delete this series? Existing specific records under this series may be affected.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axiosClient.delete(`/series/${seriesId}`);

      setSuccess('Series deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete series');
    }
  };

  return (
    <div>
      <h1>Series</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>{editingId ? 'Edit Series' : 'Create Series'}</h2>

          <form onSubmit={handleSubmit}>
            <label>Item No.</label>
            <input
              name="ItemNoID"
              value={form.ItemNoID}
              onChange={handleChange}
              style={styles.input}
              placeholder="1.1"
              required
            />

            <label>Series Name</label>
            <input
              name="SeriesName"
              value={form.SeriesName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Administrative Records"
              required
            />

            <label>Department</label>
            <select
              name="DepartmentID"
              value={form.DepartmentID}
              onChange={handleChange}
              style={styles.input}
              disabled={loadingDepartments}
              required
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'Select department'}
              </option>

              {departments.map((department) => (
                <option
                  key={department.DepartmentID}
                  value={department.DepartmentID}
                >
                  {department.DepartmentName}
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
            <h2>Series List</h2>

            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
                placeholder="Search series..."
              />

              <select
                value={departmentFilter}
                onChange={handleDepartmentFilter}
                style={styles.searchInput}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option
                    key={department.DepartmentID}
                    value={department.DepartmentID}
                  >
                    {department.DepartmentName}
                  </option>
                ))}
              </select>

              <button type="submit" style={styles.button}>
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading series...</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Item No.</th>
                      <th style={styles.th}>Series Name</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {seriesList.length === 0 ? (
                      <tr>
                        <td style={styles.td} colSpan="4">
                          No series found.
                        </td>
                      </tr>
                    ) : (
                      seriesList.map((series) => (
                        <tr key={series.SeriesID}>
                          <td style={styles.td}>{series.ItemNoID}</td>
                          <td style={styles.td}>{series.SeriesName}</td>
                          <td style={styles.td}>
                            {series.Department?.DepartmentName || '-'}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleEdit(series)}
                              style={styles.smallButton}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(series.SeriesID)}
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

export default Series;