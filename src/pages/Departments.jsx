import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get('/departments', {
          params: {
            page,
            limit,
            search: submittedSearch,
          },
        });

        const result = response.data.data;

        setDepartments(result.data || []);
        setMeta(result);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [page, limit, submittedSearch, refreshKey]);

  const resetForm = () => {
    setDepartmentName('');
    setEditingId(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await axiosClient.put(`/departments/${editingId}`, {
          DepartmentName: departmentName,
        });

        setSuccess('Department updated successfully.');
      } else {
        await axiosClient.post('/departments', {
          DepartmentName: departmentName,
        });

        setSuccess('Department created successfully.');
      }

      resetForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (department) => {
    setEditingId(department.DepartmentID);
    setDepartmentName(department.DepartmentName);
  };

  const handleDelete = async (departmentId) => {
    const confirmed = window.confirm(
      'Delete this department? Existing series under this department may be affected.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await axiosClient.delete(`/departments/${departmentId}`);

      setSuccess('Department deleted successfully.');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div>
      <h1>Departments</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>{editingId ? 'Edit Department' : 'Create Department'}</h2>

          <form onSubmit={handleSubmit}>
            <label>Department Name</label>
            <input
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              style={styles.input}
              placeholder="Records Management Office"
              required
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
          <div style={styles.header}>
            <h2>Department List</h2>

            <form onSubmit={handleSearch} style={styles.searchForm}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
                placeholder="Search department..."
              />

              <button type="submit" style={styles.button}>
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading departments...</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Department Name</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {departments.length === 0 ? (
                      <tr>
                        <td style={styles.td} colSpan="3">
                          No departments found.
                        </td>
                      </tr>
                    ) : (
                      departments.map((department) => (
                        <tr key={department.DepartmentID}>
                          <td style={styles.td}>{department.DepartmentID}</td>
                          <td style={styles.td}>
                            {department.DepartmentName}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleEdit(department)}
                              style={styles.smallButton}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(department.DepartmentID)
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

export default Departments;