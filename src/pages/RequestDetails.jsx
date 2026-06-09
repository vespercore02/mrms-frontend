import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getUser } from "../utils/auth";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [requestForms, setRequestForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);

  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(`/requests/${id}`);
        const data = response.data.data;

        setRequest(data);
        setStatus(data.Status);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestForms = async () => {
      try {
        setLoadingForms(true);

        const response = await axiosClient.get("/request-forms", {
          params: {
            requestId: id,
          },
        });

        setRequestForms(response.data.data || []);
      } catch (err) {
        console.error("Failed to load request forms", err);
        setRequestForms([]);
      } finally {
        setLoadingForms(false);
      }
    };

    fetchRequest();
    fetchRequestForms();
  }, [id, refreshKey]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await axiosClient.patch(`/requests/${id}/status`, {
        Status: status,
        ChangedBy: user?.UserID,
        Remarks: remarks,
      });

      setSuccess("Request status updated successfully.");
      setRemarks("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitRequest = async () => {
    const confirmed = window.confirm(
      "Submit this draft request? Make sure Annex A is completed before submitting.",
    );

    if (!confirmed) return;

    try {
      setSubmittingRequest(true);
      setError("");
      setSuccess("");

      await axiosClient.patch(`/requests/${id}/submit`);

      setSuccess("Request submitted successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit request. Please check required forms.",
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) return <p>Loading request details...</p>;

  if (!request) {
    return (
      <div>
        <button onClick={() => navigate("/requests")} style={styles.backBtn}>
          Back
        </button>
        <p>Request not found.</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/requests")} style={styles.backBtn}>
        ← Back to Requests
      </button>

      <h1>Request Details</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Request Information</h2>
          <Info label="Request Code" value={request.RequestCode} />
          <Info label="Request Type" value={request.RequestType} />
          <Info label="Status" value={request.Status} />
          <Info label="Remarks" value={request.Remarks || "-"} />
          <Info
            label="Created"
            value={new Date(request.createdAt).toLocaleString()}
          />
        </div>

        <div style={styles.card}>
          <h2>Agency Information</h2>
          <Info
            label="Agency Name"
            value={request.AgencyForm?.AgencyName || "-"}
          />
          <Info
            label="Agency Address"
            value={request.AgencyForm?.AgencyAddress || "-"}
          />
          <Info
            label="Agency Contact"
            value={request.AgencyForm?.AgencyContact || "-"}
          />
        </div>

        <div style={styles.card}>
          <h2>Requester</h2>
          <Info label="Name" value={request.requester?.FullName || "-"} />
          <Info label="Email" value={request.requester?.Email || "-"} />
          <Info label="Role" value={request.requester?.Role?.RoleName || "-"} />
        </div>

        <div style={styles.card}>
          <h2>Update Status</h2>

          <form onSubmit={handleUpdateStatus}>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.input}
            >
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="RECEIVED">Received</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="FOR_COMPLIANCE">For Compliance</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={styles.textarea}
              placeholder="Add remarks..."
            />

            <button type="submit" disabled={updating} style={styles.button}>
              {updating ? "Updating..." : "Update Status"}
            </button>

            {request?.Status === "DRAFT" && (
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submittingRequest}
                style={styles.submitButton}
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </form>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Status History</h2>

        {request.RequestStatusHistories?.length === 0 ? (
          <p>No status history.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Old Status</th>
                <th style={styles.th}>New Status</th>
                <th style={styles.th}>Remarks</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {request.RequestStatusHistories?.map((history) => (
                <tr key={history.HistoryID}>
                  <td style={styles.td}>{history.OldStatus || "-"}</td>
                  <td style={styles.td}>{history.NewStatus}</td>
                  <td style={styles.td}>{history.Remarks || "-"}</td>
                  <td style={styles.td}>
                    {new Date(history.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h2>Request Forms</h2>

        {loadingForms ? (
          <p>Loading request forms...</p>
        ) : requestForms.length === 0 ? (
          <p>No forms created for this request yet.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Form Code</th>
                  <th style={styles.th}>Form Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {requestForms.map((form) => (
                  <tr key={form.RequestFormID}>
                    <td style={styles.td}>
                      <strong>{form.RequestFormType?.FormCode || "-"}</strong>
                    </td>
                    <td style={styles.td}>
                      {form.RequestFormType?.FormName || "-"}
                    </td>
                    <td style={styles.td}>
                      {form.RequestFormType?.FormCategory || "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{form.Status}</span>
                    </td>
                    <td style={styles.td}>{form.Remarks || "-"}</td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() =>
                          navigate(`/request-forms/${form.RequestFormID}`)
                        }
                      >
                        Open Form
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  backBtn: {
    marginBottom: "16px",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    marginBottom: "16px",
  },
  info: {
    margin: "8px 0",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 12px",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 12px",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: "16px",
  },
  success: {
    padding: "12px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },

  tableWrap: {
    overflowX: "auto",
    marginTop: "16px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "bold",
  },
  smallButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
  },
};

export default RequestDetails;
