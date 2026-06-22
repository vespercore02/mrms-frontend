import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getUser } from "../utils/auth";
import {
  getRequestStatusStyle,
  formatRequestStatus,
} from "../utils/statusColors";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [request, setRequest] = useState(null);
  //const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [cabinets, setCabinets] = useState([]);
  const [cabinetBays, setCabinetBays] = useState([]);
  const [storageBoxes, setStorageBoxes] = useState([]);

  const [storageForm, setStorageForm] = useState({
    CabinetID: "",
    CabinetBayID: "",
    StorageBoxID: "",
  });

  const [assigningStorage, setAssigningStorage] = useState(false);

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

    const fetchCabinets = async () => {
      try {
        const response = await axiosClient.get("/cabinets");
        setCabinets(response.data.data || []);
      } catch (err) {
        console.error("Failed to load cabinets", err);
      }
    };

    fetchRequest();
    fetchRequestForms();
    if (request?.Status === "RECEIVED_FOR_STORAGE") {
      fetchCabinets();
    }
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

  const getFormChecklistStatus = (form) => {
    if (["SUBMITTED", "REVIEWED", "APPROVED"].includes(form.Status)) {
      return {
        label: "Completed",
        symbol: "✓",
        style: styles.completedChecklist,
      };
    }

    const hasData = form.FormData && Object.keys(form.FormData).length > 0;

    if (hasData) {
      return {
        label: "Draft Saved",
        symbol: "◐",
        style: styles.draftChecklist,
      };
    }

    return {
      label: "Not Started",
      symbol: "○",
      style: styles.pendingChecklist,
    };
  };

  const getRequiredChecklistForms = () => {
    return requestForms.filter((form) => form.RequirementType === "REQUIRED");
  };

  const getConditionalChecklistForms = () => {
    return requestForms.filter((form) =>
      ["CONDITIONAL", "OPTIONAL"].includes(form.RequirementType),
    );
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

  const getAvailableActions = () => {
    if (!request) return [];

    const roleName = user?.Role?.RoleName;

    const isCROUser = ["Admin", "Records Head", "Records Officer"].includes(
      roleName,
    );

    const isDepartmentHead = roleName === "Department Head";

    const isDepartmentCustodian = roleName === "Department Custodian";

    if (request.Status === "DRAFT" && isDepartmentCustodian) {
      return [
        {
          label: "Submit Request",
          status: "SUBMITTED",
          type: "submit",
        },
      ];
    }

    if (request.Status === "SUBMITTED" && isDepartmentHead) {
      return [
        {
          label: "Approve to CRO",
          status: "DEPARTMENT_APPROVED",
        },
        {
          label: "Return for Compliance",
          status: "FOR_COMPLIANCE",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (request.Status === "DEPARTMENT_APPROVED" && isCROUser) {
      return [
        {
          label: "Receive Request",
          status: "RECEIVED",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (request.Status === "RECEIVED" && isCROUser) {
      return [
        {
          label: "Start Review",
          status: "UNDER_REVIEW",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (
      request.Status === "UNDER_REVIEW" &&
      ["Admin", "Records Officer"].includes(roleName)
    ) {
      return [
        {
          label: "Submit to CRH",
          status: "FOR_CRH_APPROVAL",
        },
        {
          label: "For Compliance",
          status: "FOR_COMPLIANCE",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (
      request.Status === "FOR_CRH_APPROVAL" &&
      ["Admin", "Records Head"].includes(roleName)
    ) {
      return [
        {
          label: "Approve",
          status: "APPROVED",
        },
        {
          label: "For Compliance",
          status: "FOR_COMPLIANCE",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (
      request.Status === "FOR_COMPLIANCE" &&
      ["Department Custodian", "Department Head"].includes(roleName)
    ) {
      return [
        {
          label: "Resubmit Compliance",
          status: "RESUBMITTED",
        },
      ];
    }

    if (request.Status === "RESUBMITTED" && roleName === "Department Head") {
      return [
        {
          label: "Approve to CRO",
          status: "DEPARTMENT_APPROVED",
        },
        {
          label: "Return for Compliance",
          status: "FOR_COMPLIANCE",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (request.Status === "RESUBMITTED" && isCROUser) {
      return [
        {
          label: "Continue Review",
          status: "UNDER_REVIEW",
        },
        {
          label: "Approve",
          status: "APPROVED",
        },
        {
          label: "For Compliance",
          status: "FOR_COMPLIANCE",
        },
        {
          label: "Reject",
          status: "REJECTED",
        },
      ];
    }

    if (request.Status === "APPROVED" && isCROUser) {
      return [
        {
          label: "Authorize Transmittal",
          status: "FOR_TRANSMITTAL",
        },
      ];
    }

    if (request.Status === "FOR_TRANSMITTAL" && isCROUser) {
      return [
        {
          label: "Receive Records for Storage",
          status: "RECEIVED_FOR_STORAGE",
        },
      ];
    }

    if (request.Status === "RECEIVED_FOR_STORAGE" && isCROUser) {
      return [
        {
          label: "Assign Storage Location",
          status: "STORAGE_ASSIGNED",
        },
      ];
    }

    if (request.Status === "STORAGE_ASSIGNED" && isCROUser) {
      return [
        {
          label: "Complete Request",
          status: "COMPLETED",
        },
      ];
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

  const handleStorageChange = async (e) => {
    const { name, value } = e.target;

    setStorageForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "CabinetID") {
      setStorageForm((prev) => ({
        ...prev,
        CabinetID: value,
        CabinetBayID: "",
        StorageBoxID: "",
      }));

      try {
        const response = await axiosClient.get("/cabinet-bays", {
          params: { CabinetID: value },
        });

        setCabinetBays(response.data.data || []);
        setStorageBoxes([]);
      } catch (err) {
        console.error("Failed to load cabinet bays", err);
      }
    }

    if (name === "CabinetBayID") {
      setStorageForm((prev) => ({
        ...prev,
        CabinetBayID: value,
        StorageBoxID: "",
      }));

      try {
        const response = await axiosClient.get("/storage-boxes/available", {
          params: {
            CabinetID: storageForm.CabinetID,
            CabinetBayID: value,
          },
        });

        setStorageBoxes(response.data.data || []);
      } catch (err) {
        console.error("Failed to load storage boxes", err);
      }
    }
  };

  const handleAssignStorage = async () => {
    if (
      !storageForm.CabinetID ||
      !storageForm.CabinetBayID ||
      !storageForm.StorageBoxID
    ) {
      setError("Please select cabinet, bay, and storage box.");
      return;
    }

    try {
      setAssigningStorage(true);
      setError("");
      setSuccess("");

      await axiosClient.patch(`/requests/${id}/storage-location`, {
        CabinetID: Number(storageForm.CabinetID),
        CabinetBayID: Number(storageForm.CabinetBayID),
        StorageBoxID: Number(storageForm.StorageBoxID),
        AssignedBy: user?.UserID,
      });

      setSuccess("Storage location assigned successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign storage.");
    } finally {
      setAssigningStorage(false);
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate("/requests")} style={styles.backBtn}>
        ← Back to Requests
      </button>

      <h1>Request Details</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.detailsLayout}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h2>Request Information</h2>

            <div style={styles.priorityInfo}>
              <Info label="Request Code" value={request.RequestCode} />

              <Info
                label="Request Type"
                value={
                  request.RequestTypeInfo?.RequestTypeName ||
                  request.RequestType ||
                  "-"
                }
              />

              <p style={styles.info}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    ...styles.statusBadge,
                    ...getRequestStatusStyle(request.Status),
                  }}
                >
                  {formatRequestStatus(request.Status)}
                </span>
              </p>
            </div>

            <hr style={styles.divider} />

            <div style={styles.formGrid}>
              <Info
                label="Requested By"
                value={request.requester?.FullName || "-"}
              />
              <Info label="Email" value={request.requester?.Email || "-"} />
              <Info
                label="Department"
                value={request.Department?.DepartmentName || "-"}
              />
              <Info
                label="Role"
                value={request.requester?.Role?.RoleName || "-"}
              />
              <Info
                label="Created"
                value={new Date(request.createdAt).toLocaleString()}
              />
            </div>

            <div style={styles.fullWidthInfo}>
              <Info label="Remarks" value={request.Remarks || "-"} />
            </div>

            <hr style={styles.divider} />

            <h3>Request Actions</h3>

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

          {request.StorageBoxID && (
            <div style={styles.card}>
              <h2>Storage Location</h2>

              <div style={styles.formGrid}>
                <Info
                  label="Cabinet"
                  value={request.Cabinet?.CabinetCode || "-"}
                />

                <Info
                  label="Cabinet Bay"
                  value={request.CabinetBay?.BayCode || "-"}
                />

                <Info
                  label="Storage Box"
                  value={request.StorageBox?.BoxCode || "-"}
                />

                <Info
                  label="Box Status"
                  value={request.StorageBox?.Status || "-"}
                />
              </div>
            </div>
          )}

          {request.Status === "RECEIVED_FOR_STORAGE" && (
            <div style={styles.card}>
              <h2>Storage Assignment</h2>

              <label>Cabinet</label>
              <select
                name="CabinetID"
                value={storageForm.CabinetID}
                onChange={handleStorageChange}
                style={styles.input}
              >
                <option value="">Select Cabinet</option>
                {cabinets.map((cabinet) => (
                  <option key={cabinet.CabinetID} value={cabinet.CabinetID}>
                    {cabinet.CabinetName || cabinet.CabinetCode}
                  </option>
                ))}
              </select>

              <label>Cabinet Bay</label>
              <select
                name="CabinetBayID"
                value={storageForm.CabinetBayID}
                onChange={handleStorageChange}
                style={styles.input}
                disabled={!storageForm.CabinetID}
              >
                <option value="">Select Bay</option>
                {cabinetBays.map((bay) => (
                  <option key={bay.CabinetBayID} value={bay.CabinetBayID}>
                    {bay.BayName || bay.BayCode}
                  </option>
                ))}
              </select>

              <label>Storage Box</label>
              <select
                name="StorageBoxID"
                value={storageForm.StorageBoxID}
                onChange={handleStorageChange}
                style={styles.input}
                disabled={!storageForm.CabinetBayID}
              >
                <option value="">Select Box</option>
                {storageBoxes.map((box) => (
                  <option key={box.StorageBoxID} value={box.StorageBoxID}>
                    {box.BoxCode || box.BoxName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAssignStorage}
                disabled={assigningStorage}
                style={styles.submitButton}
              >
                {assigningStorage ? "Assigning..." : "Save Storage Assignment"}
              </button>
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

          {/* Forms Dashboard card here */}
          {requestForms.length > 0 && (
            <div style={styles.card}>
              <h2>Forms Dashboard</h2>

              <h3>Required Forms</h3>

              <div style={styles.checklistGrid}>
                {getRequiredChecklistForms().map((form) => {
                  const status = getFormChecklistStatus(form);

                  return (
                    <div
                      key={form.RequestFormID}
                      style={{
                        ...styles.checklistItem,
                        ...status.style,
                      }}
                      onClick={() =>
                        navigate(`/request-forms/${form.RequestFormID}`)
                      }
                    >
                      <div style={styles.checklistSymbol}>{status.symbol}</div>

                      <div>
                        <strong>{form.RequestFormType?.FormCode}</strong>
                        <p style={styles.checklistName}>
                          {form.RequestFormType?.FormName}
                        </p>
                        <small>{status.label}</small>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 style={styles.sectionSubheading}>
                Conditional / Optional Forms
              </h3>

              {getConditionalChecklistForms().length === 0 ? (
                <p style={styles.muted}>
                  No conditional or optional forms attached.
                </p>
              ) : (
                <div style={styles.checklistGrid}>
                  {getConditionalChecklistForms().map((form) => {
                    const status = getFormChecklistStatus(form);

                    return (
                      <div
                        key={form.RequestFormID}
                        style={{
                          ...styles.checklistItem,
                          ...status.style,
                        }}
                        onClick={() =>
                          navigate(`/request-forms/${form.RequestFormID}`)
                        }
                      >
                        <div style={styles.checklistSymbol}>
                          {status.symbol}
                        </div>

                        <div>
                          <strong>{form.RequestFormType?.FormCode}</strong>
                          <p style={styles.checklistName}>
                            {form.RequestFormType?.FormName}
                          </p>
                          <small>{status.label}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Request Forms table card here */}
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
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Completion</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requestForms.map((form) => {
                      const label = getFormCompletion(form);

                      return (
                        <tr key={form.RequestFormID}>
                          <td style={styles.td}>
                            <strong>
                              {form.RequestFormType?.FormCode || "-"}
                            </strong>
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
                            <span style={styles.badge}>
                              {formatRequestStatus(form.Status)}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...getCompletionStyle(label),
                              }}
                            >
                              {label}
                            </span>
                          </td>

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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <h2>Status History</h2>

            {request.RequestStatusHistories?.length === 0 ? (
              <p>No status history.</p>
            ) : (
              <div style={styles.timeline}>
                {request.RequestStatusHistories?.map((history, index) => (
                  <div key={history.HistoryID} style={styles.timelineItem}>
                    <div style={styles.timelineLeft}>
                      <div style={styles.timelineDot} />

                      {index !== request.RequestStatusHistories.length - 1 && (
                        <div style={styles.timelineLine} />
                      )}
                    </div>

                    <div style={styles.timelineContent}>
                      <div
                        style={{
                          ...styles.timelineStatusBadge,
                          ...getRequestStatusStyle(history.NewStatus),
                        }}
                      >
                        {formatRequestStatus(history.NewStatus)}
                      </div>

                      <div style={styles.timelineMeta}>
                        {history.User?.FullName || "System"}
                      </div>

                      <div style={styles.timelineDate}>
                        {new Date(history.createdAt).toLocaleString()}
                      </div>

                      {history.Remarks && (
                        <div style={styles.timelineRemarks}>
                          {history.Remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  page: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  detailsLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
    gap: "20px",
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  rightColumn: {
    position: "sticky",
    top: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px 20px",
  },

  fullWidthInfo: {
    marginTop: "12px",
  },

  divider: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "20px 0",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  timelineItem: {
    display: "flex",
    gap: "12px",
  },

  timelineLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#2563eb",
    marginTop: "4px",
  },

  timelineLine: {
    width: "2px",
    flex: 1,
    background: "#d1d5db",
    marginTop: "4px",
  },

  timelineContent: {
    flex: 1,
    paddingBottom: "16px",
  },

  timelineStatus: {
    fontWeight: "bold",
    fontSize: "14px",
  },

  timelineMeta: {
    fontSize: "13px",
    color: "#6b7280",
  },

  timelineDate: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  timelineRemarks: {
    marginTop: "6px",
    padding: "8px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "13px",
  },

  timelineStatusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "12px",
    marginBottom: "6px",
  },
  priorityInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "12px",
  },
};

export default RequestDetails;
