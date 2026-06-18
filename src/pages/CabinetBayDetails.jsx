import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStorageBoxStatusStyle } from "../utils/storageStatusColors";
import AccessDenied from "../components/AccessDenied";
import { isForbiddenError, getApiErrorMessage } from "../utils/errorHelpers";

const emptyBoxForm = {
  DepartmentID: "",
  EstimatedWeightKg: "",
  Remarks: "",
};

const CabinetBayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState(false);

  const [bay, setBay] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [boxForm, setBoxForm] = useState(emptyBoxForm);

  const [loading, setLoading] = useState(true);
  const [savingBox, setSavingBox] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBayDetails = async () => {
      try {
        setLoading(true);

        const bayResponse = await axiosClient.get(`/cabinet-bays/${id}`);
        setBay(bayResponse.data.data);

        const boxesResponse = await axiosClient.get("/storage-boxes", {
          params: {
            cabinetBayId: id,
          },
        });

        setBoxes(boxesResponse.data.data || []);
        setError("");
      } catch (err) {
        if (isForbiddenError(err)) {
          setAccessDenied(true);
          return;
        }

        setError(getApiErrorMessage(err, "Failed to load data"));
      } finally {
        setLoading(false);
      }
    };

    fetchBayDetails();
  }, [id, refreshKey]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosClient.get("/departments");
        const result = response.data.data;

        setDepartments(result.data || result || []);
      } catch {
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  const handleBoxChange = (e) => {
    setBoxForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetBoxForm = () => {
    setBoxForm(emptyBoxForm);
  };

  const handleAddBox = async (e) => {
    e.preventDefault();

    if (!boxForm.EstimatedWeightKg) {
      setError("Estimated weight is required.");
      return;
    }

    try {
      setSavingBox(true);
      setError("");
      setSuccess("");

      await axiosClient.post("/storage-boxes", {
        CabinetBayID: Number(id),
        DepartmentID: boxForm.DepartmentID
          ? Number(boxForm.DepartmentID)
          : null,
        EstimatedWeightKg: Number(boxForm.EstimatedWeightKg),
        Remarks: boxForm.Remarks,
      });

      setSuccess("Storage box added successfully.");
      resetBoxForm();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add storage box");
    } finally {
      setSavingBox(false);
    }
  };

  const handleDeleteBox = async (storageBoxId) => {
    const confirmed = window.confirm("Delete this storage box?");

    if (!confirmed) return;

    if (
      !window.confirm("Deactivate this storage box? It will remain in history.")
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axiosClient.delete(`/storage-boxes/${storageBoxId}`);

      setSuccess("Storage box deleted successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete storage box");
    }
  };

  const getWeightPercent = () => {
    if (!bay) return 0;

    const current = Number(bay.CurrentWeightKg || 0);
    const max = Number(bay.MaxWeightKg || 0);

    if (max <= 0) return 0;

    return Math.min((current / max) * 100, 100);
  };

  const getBackPath = () => {
    if (!bay?.Cabinet) return "/cabinets";

    return `/cabinets/${bay.Cabinet.CabinetID}`;
  };

  if (loading) return <p>Loading bay details...</p>;
  if (accessDenied) return <AccessDenied />;

  if (!bay) {
    return (
      <div>
        <button onClick={() => navigate("/cabinets")} style={styles.backBtn}>
          ← Back to Cabinets
        </button>
        <p>Bay not found.</p>
      </div>
    );
  }

  const remainingWeight =
    Number(bay.MaxWeightKg || 0) - Number(bay.CurrentWeightKg || 0);

  const remainingBoxes =
    Number(bay.MaxBoxes || 0) - Number(bay.CurrentBoxes || 0);

  const isAddDisabled =
    bay.Status === "MAINTENANCE" ||
    bay.Status === "FULL" ||
    bay.Status === "OVERWEIGHT";

  const occupiedBoxes = boxes.filter((box) => box.Status === "OCCUPIED").length;
  const availableBoxes = boxes.filter(
    (box) => box.Status === "AVAILABLE",
  ).length;

  return (
    <div>
      <button onClick={() => navigate(getBackPath())} style={styles.backBtn}>
        ← Back to Cabinet
      </button>

      <h1>{bay.BayCode}</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Cabinet" value={bay.Cabinet?.CabinetCode} />
        <SummaryCard title="Side" value={bay.Side} />
        <SummaryCard title="Level" value={bay.LevelNumber} />
        <SummaryCard title="Bay" value={bay.BayNumber} />
        <SummaryCard title="Status" value={bay.Status} />
        <SummaryCard title="Boxes" value={`${occupiedBoxes}/${bay.MaxBoxes}`} />

        <SummaryCard title="Available" value={availableBoxes} />
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Bay Capacity</h2>

          <p>
            <strong>Weight:</strong> {Number(bay.CurrentWeightKg).toFixed(2)} /{" "}
            {Number(bay.MaxWeightKg).toFixed(2)} kg
          </p>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${getWeightPercent()}%`,
              }}
            />
          </div>

          <p style={styles.muted}>
            Remaining Weight: {remainingWeight.toFixed(2)} kg
          </p>

          <p>
            <strong>Box Capacity:</strong> {bay.CurrentBoxes}/{bay.MaxBoxes}
          </p>

          <p style={styles.muted}>Remaining Boxes: {remainingBoxes}</p>
        </div>

        <div style={styles.card}>
          <h2>Add Storage Box</h2>

          {isAddDisabled ? (
            <p style={styles.warning}>
              This bay is not available for adding boxes.
            </p>
          ) : (
            <form onSubmit={handleAddBox}>
              <label>Department</label>
              <select
                name="DepartmentID"
                value={boxForm.DepartmentID}
                onChange={handleBoxChange}
                style={styles.input}
              >
                <option value="">No department selected</option>

                {departments.map((department) => (
                  <option
                    key={department.DepartmentID}
                    value={department.DepartmentID}
                  >
                    {department.DepartmentName}
                  </option>
                ))}
              </select>

              <label>Estimated Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                name="EstimatedWeightKg"
                value={boxForm.EstimatedWeightKg}
                onChange={handleBoxChange}
                style={styles.input}
                placeholder="12.50"
                required
              />

              <label>Remarks</label>
              <textarea
                name="Remarks"
                value={boxForm.Remarks}
                onChange={handleBoxChange}
                style={styles.textarea}
                placeholder="Box description / notes..."
              />

              <button type="submit" disabled={savingBox} style={styles.button}>
                {savingBox ? "Adding..." : "Add Box"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h2>Boxes in this Bay</h2>

        {boxes.length === 0 ? (
          <p>No boxes assigned to this bay yet.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Box Code</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Weight</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Request</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {boxes.map((box) => {
                  const requestRecord = box.BoxRecords?.find(
                    (record) => record.RequestID,
                  );
                  const request = requestRecord?.Request;

                  return (
                    <tr key={box.StorageBoxID}>
                      <td style={styles.td}>
                        <strong>{box.BoxCode}</strong>
                      </td>
                      <td style={styles.td}>
                        {box.Department?.DepartmentName || "-"}
                      </td>
                      <td style={styles.td}>
                        {Number(box.EstimatedWeightKg).toFixed(2)} kg
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...getStorageBoxStatusStyle(box.Status),
                          }}
                        >
                          {box.Status}
                        </span>
                      </td>
                      <td style={styles.td}>{box.Remarks || "-"}</td>
                      <td style={styles.td}>
                        {request ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/requests/${request.RequestID}`)
                            }
                            style={styles.requestLink}
                          >
                            <strong>{request.RequestCode}</strong>
                            <span>{request.RequestType}</span>
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => handleDeleteBox(box.StorageBoxID)}
                          style={styles.deleteButton}
                        >
                          Deactivate
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
  );
};

const SummaryCard = ({ title, value }) => (
  <div style={styles.summaryCard}>
    <p style={styles.summaryTitle}>{title}</p>
    <h3 style={styles.summaryValue}>{value || "-"}</h3>
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  summaryCard: {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  summaryTitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  summaryValue: {
    margin: "8px 0 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)",
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
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 14px",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 14px",
  },
  progressBar: {
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
    margin: "10px 0",
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
    transition: "width 0.3s ease",
  },
  muted: {
    color: "#6b7280",
    fontSize: "14px",
  },
  warning: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fef3c7",
    color: "#92400e",
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: "16px",
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
    verticalAlign: "top",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  smallButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    marginRight: "6px",
  },
  deleteButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
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
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },

  requestLink: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "10px",
    background: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "left",
  },
  INACTIVE: {
    background: "#e5e7eb",
    color: "#374151",
  },
};

export default CabinetBayDetails;
