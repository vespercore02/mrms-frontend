import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get('/audit-logs');

        setLogs(response.data.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const formatJson = (value) => {
    if (!value) return '-';

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div>
      <h1>Audit Logs</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>System Activity</h2>

          {loading ? (
            <p>Loading audit logs...</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Table</th>
                    <th style={styles.th}>Record</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td style={styles.td} colSpan="5">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.AuditLogID}
                        onClick={() => setSelectedLog(log)}
                        style={styles.row}
                      >
                        <td style={styles.td}>
                          <span style={styles.badge}>{log.Action}</span>
                        </td>
                        <td style={styles.td}>{log.TableName}</td>
                        <td style={styles.td}>{log.RecordID || '-'}</td>
                        <td style={styles.td}>
                          {log.User?.FullName || log.PerformedBy || '-'}
                        </td>
                        <td style={styles.td}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2>Log Details</h2>

          {!selectedLog ? (
            <p>Select a log from the table.</p>
          ) : (
            <>
              <Info label="Action" value={selectedLog.Action} />
              <Info label="Table" value={selectedLog.TableName} />
              <Info label="Record ID" value={selectedLog.RecordID || '-'} />
              <Info
                label="Performed By"
                value={selectedLog.User?.FullName || selectedLog.PerformedBy || '-'}
              />
              <Info
                label="Date"
                value={new Date(selectedLog.createdAt).toLocaleString()}
              />

              <h3>Old Value</h3>
              <pre style={styles.pre}>{formatJson(selectedLog.OldValue)}</pre>

              <h3>New Value</h3>
              <pre style={styles.pre}>{formatJson(selectedLog.NewValue)}</pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <p style={styles.info}>
    <strong>{label}:</strong> {value}
  </p>
);

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr minmax(300px, 420px)',
    gap: '16px',
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
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
  row: {
    cursor: 'pointer',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '999px',
    background: '#ede9fe',
    color: '#5b21b6',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  info: {
    margin: '8px 0',
  },
  pre: {
    background: '#111827',
    color: '#f9fafb',
    padding: '12px',
    borderRadius: '8px',
    overflowX: 'auto',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
  },
  error: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    marginBottom: '16px',
  },
};

export default AuditLogs;