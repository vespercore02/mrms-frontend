import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get("/requests", {
          params: {
            page,
            limit,
            search: submittedSearch,
            status,
          },
        });

        const result = response.data.data;

        setRequests(result.data || []);
        setMeta(result);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, limit, status, submittedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    setSubmittedSearch(search);
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Requests</h1>

        <button
          onClick={() => navigate("/requests/create")}
          style={styles.button}
        >
          + Create Request
        </button>
      </div>

      <form onSubmit={handleSearch} style={styles.filters}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search request..."
          style={styles.input}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.input}
        >
          <option value="">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="RECEIVED">Received</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="FOR_COMPLIANCE">For Compliance</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <button type="submit" style={styles.button}>
          Search
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Agency</th>
                  <th style={styles.th}>Requested By</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>

              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan="6">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr
                      key={request.RequestID}
                      onClick={() => navigate(`/requests/${request.RequestID}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={styles.td}>{request.RequestCode}</td>

                      <td style={styles.td}>{request.RequestType}</td>

                      <td style={styles.td}>
                        {request.AgencyForm?.AgencyName || "-"}
                      </td>

                      <td style={styles.td}>
                        {request.requester?.FullName || "-"}
                      </td>

                      <td style={styles.td}>
                        <span style={styles.badge}>{request.Status}</span>
                      </td>

                      <td style={styles.td}>
                        {new Date(request.createdAt).toLocaleDateString()}
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
  );
};

const styles = {
  title: {
    marginBottom: "20px",
  },

  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  input: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    minWidth: "180px",
  },

  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "bold",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
  },

  pageButton: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },

  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
};

export default Requests;
