import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getUser } from "../utils/auth";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [request, setRequest] = useState(null);
  //const [status, setStatus] = useState("");
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
        //setStatus(data.Status);
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

  const getCompletionStyle = (label) => {
    if (label === "Approved") return styles.approvedBadge;
    if (label === "Reviewed") return styles.reviewedBadge;
    if (label === "Completed") return styles.completedBadge;
    if (label === "Draft Saved") return styles.draftBadge;

    return styles.notStartedBadge;
  };

  const getFormCompletion = (form) => {
    const hasData = form.FormData && Object.keys(form.FormData).length > 0;

    if (form.Status === "APPROVED") return "Approved";
    if (form.Status === "REVIEWED") return "Reviewed";
    if (form.Status === "SUBMITTED") return "Completed";
    if (hasData) return "Draft Saved";

    return "Not Started";
  };

  const isFormCompleted = (form) => {
    return ["SUBMITTED", "REVIEWED", "APPROVED"].includes(form.Status);
  };

  const getRequiredForms = () => {
    return requestForms.filter((form) => form.RequirementType === "REQUIRED");
  };

  const areRequiredFormsCompleted = () => {
    const requiredForms = getRequiredForms();

    if (requiredForms.length === 0) return false;

    return requiredForms.every((form) => isFormCompleted(form));
  };

  const getRequiredFormsMessage = () => {
    const requiredForms = getRequiredForms();
    const incompleteForms = requiredForms.filter(
      (form) => !isFormCompleted(form),
    );

    if (incompleteForms.length === 0) {
      return "All required forms are completed.";
    }

    const names = incompleteForms
      .map((form) => form.RequestFormType?.FormCode || "Unknown Form")
      .join(", ");

    return `Complete required forms first: ${names}`;
  };

  const getRequestProgress = () => {
    const requiredForms = getRequiredForms();
    const totalRequired = requiredForms.length;
    const completedForms = requiredForms.filter(isFormCompleted).length;
    const remainingForms = totalRequired - completedForms;

    const percentage =
      totalRequired === 0
        ? 0
        : Math.round((completedForms / totalRequired) * 100);

    return {
      totalRequired,
      completedForms,
      remainingForms,
      percentage,
    };
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

  const roleName = user?.Role?.RoleName;

  const isCROUser = ["Admin", "Records Head", "Records Officer"].includes(
    roleName,
  );

  const getAvailableActions = () => {
    if (!request) return [];

    if (request.Status === "DRAFT") {
      return [
        {
          label: "Submit Request",
          status: "SUBMITTED",
          type: "submit",
          allowed: true,
        },
      ];
    }

    if (!isCROUser) return [];

    if (request.Status === "SUBMITTED") {
      return [
        { label: "Receive Request", status: "RECEIVED" },
        { label: "Reject", status: "REJECTED" },
      ];
    }

    if (request.Status === "RECEIVED") {
      return [
        { label: "Start Review", status: "UNDER_REVIEW" },
        { label: "Reject", status: "REJECTED" },
      ];
    }

    if (request.Status === "UNDER_REVIEW") {
      return [
        { label: "For Compliance", status: "FOR_COMPLIANCE" },
        { label: "Approve", status: "APPROVED" },
        { label: "Reject", status: "REJECTED" },
      ];
    }

    if (request.Status === "APPROVED") {
      return [{ label: "Complete Request", status: "COMPLETED" }];
    }

    return [];
  };

  const handleActionStatus = async (nextStatus) => {
    const confirmed = window.confirm(`Proceed with action: ${nextStatus}?`);

    if (!confirmed) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      await axiosClient.patch(`/requests/${id}/status`, {
        Status: nextStatus,
        ChangedBy: user?.UserID,
        Remarks: remarks,
      });

      setSuccess(`Request updated to ${nextStatus}.`);
      setRemarks("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    } finally {
      setUpdating(false);
    }
  };

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
          <Info label="Department" value={request.Department?.DepartmentName} />
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
        {/*
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
                disabled={submittingRequest || !areRequiredFormsCompleted()}
                style={{
                  ...styles.submitButton,
                  ...(submittingRequest || !areRequiredFormsCompleted()
                    ? styles.disabledButton
                    : {}),
                }}
                title={
                  areRequiredFormsCompleted()
                    ? "Submit request"
                    : getRequiredFormsMessage()
                }
              >
                {submittingRequest ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </form>
        </div>
        */}

        <div style={styles.card}>
          <h2>Request Actions</h2>

          <label>Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={styles.textarea}
            placeholder="Optional remarks for this action..."
          />

          <div style={styles.actions}>
            {getAvailableActions().length === 0 ? (
              <p style={styles.muted}>
                No available actions for your role/status.
              </p>
            ) : (
              getAvailableActions().map((action) => {
                if (action.type === "submit") {
                  return (
                    <button
                      key={action.status}
                      type="button"
                      onClick={handleSubmitRequest}
                      disabled={
                        submittingRequest || !areRequiredFormsCompleted()
                      }
                      style={{
                        ...styles.submitButton,
                        ...(submittingRequest || !areRequiredFormsCompleted()
                          ? styles.disabledButton
                          : {}),
                      }}
                      title={
                        areRequiredFormsCompleted()
                          ? "Submit request"
                          : getRequiredFormsMessage()
                      }
                    >
                      {submittingRequest ? "Submitting..." : action.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => handleActionStatus(action.status)}
                    disabled={updating}
                    style={styles.button}
                  >
                    {updating ? "Processing..." : action.label}
                  </button>
                );
              })
            )}
          </div>
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

        {request?.Status === "DRAFT" && (
          <div
            style={{
              ...styles.infoBox,
              ...(areRequiredFormsCompleted()
                ? styles.readyBox
                : styles.warningBox),
            }}
          >
            {getRequiredFormsMessage()}
          </div>
        )}

        {requestForms.length > 0 && (
          <div style={styles.card}>
            <h2>Request Completion Progress</h2>

            {(() => {
              const progress = getRequestProgress();

              return (
                <>
                  <div style={styles.progressSummaryGrid}>
                    <SummaryCard
                      title="Required Forms"
                      value={progress.totalRequired}
                    />
                    <SummaryCard
                      title="Completed"
                      value={progress.completedForms}
                    />
                    <SummaryCard
                      title="Remaining"
                      value={progress.remainingForms}
                    />
                    <SummaryCard
                      title="Progress"
                      value={`${progress.percentage}%`}
                    />
                  </div>

                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${progress.percentage}%`,
                      }}
                    />
                  </div>

                  <p style={styles.muted}>
                    {progress.completedForms} of {progress.totalRequired}{" "}
                    required forms completed.
                  </p>
                </>
              );
            })()}
          </div>
        )}

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
                  <th style={styles.th}>Requirement</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Completion</th>
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
                      <span style={styles.badge}>
                        {form.RequirementType || "OPTIONAL"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {form.RequestFormType?.FormCategory || "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{form.Status}</span>
                    </td>
                    <td style={styles.td}>
                      {(() => {
                        const label = getFormCompletion(form);

                        return (
                          <span
                            style={{
                              ...styles.badge,
                              ...getCompletionStyle(label),
                            }}
                          >
                            {label}
                          </span>
                        );
                      })()}
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

const SummaryCard = ({ title, value }) => (
  <div
    style={{
      background: "#f9fafb",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      textAlign: "center",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "#6b7280",
        fontSize: "13px",
      }}
    >
      {title}
    </p>

    <h2
      style={{
        margin: "8px 0 0",
      }}
    >
      {value}
    </h2>
  </div>
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

  approvedBadge: {
    background: "#dcfce7",
    color: "#166534",
  },
  reviewedBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  completedBadge: {
    background: "#ede9fe",
    color: "#5b21b6",
  },
  draftBadge: {
    background: "#fef3c7",
    color: "#92400e",
  },
  notStartedBadge: {
    background: "#e5e7eb",
    color: "#374151",
  },

  infoBox: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },

  readyBox: {
    background: "#dcfce7",
    color: "#166534",
  },

  warningBox: {
    background: "#fef3c7",
    color: "#92400e",
  },

  disabledButton: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },

  checklistGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },

  checklistSymbol: {
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    background: "#fff",
  },

  checklistName: {
    margin: "4px 0",
    color: "#374151",
    fontSize: "13px",
  },

  completedChecklist: {
    background: "#dcfce7",
    color: "#166534",
  },

  draftChecklist: {
    background: "#fef3c7",
    color: "#92400e",
  },

  pendingChecklist: {
    background: "#f3f4f6",
    color: "#374151",
  },

  sectionSubheading: {
    marginTop: "20px",
  },

  checklistItem: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },

  progressSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },

  progressBar: {
    width: "100%",
    height: "14px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px",
  },

  progressFill: {
    height: "100%",
    background: "#16a34a",
    transition: "width 0.3s ease",
  },

  muted: {
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default RequestDetails;
