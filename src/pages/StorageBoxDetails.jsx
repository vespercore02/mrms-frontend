import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const StorageBoxDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [box, setBox] = useState(null);
  const [boxRecords, setBoxRecords] = useState([]);
  const [dataLists, setDataLists] = useState([]);

  const [selectedDataListId, setSelectedDataListId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDataLists, setLoadingDataLists] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBoxDetails = async () => {
      try {
        setLoading(true);

        const boxResponse = await axiosClient.get(`/storage-boxes/${id}`);
        setBox(boxResponse.data.data);

        const recordsResponse = await axiosClient.get("/box-records", {
          params: {
            storageBoxId: id,
          },
        });

        setBoxRecords(recordsResponse.data.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load box details");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxDetails();
  }, [id, refreshKey]);

  useEffect(() => {
    const fetchDataLists = async () => {
      try {
        const response = await axiosClient.get("/data-lists");
        setDataLists(response.data.data || []);
      } catch {
        setDataLists([]);
      } finally {
        setLoadingDataLists(false);
      }
    };

    fetchDataLists();
  }, []);

  const assignedDataListIds = useMemo(() => {
    return boxRecords.map((record) => Number(record.DataListID));
  }, [boxRecords]);

  const availableDataLists = useMemo(() => {
    return dataLists.filter((item) => {
      const notAssigned = !assignedDataListIds.includes(
        Number(item.DataListID)
      );

      const keyword = search.toLowerCase();

      const matchesSearch =
        !keyword ||
        item.DataListSpecificName?.toLowerCase().includes(keyword) ||
        item.DataListItemNo?.toLowerCase().includes(keyword) ||
        item.AgencyUniqueID?.toLowerCase().includes(keyword);

      return notAssigned && matchesSearch;
    });
  }, [dataLists, assignedDataListIds, search]);

  const handleAssignRecord = async (e) => {
    e.preventDefault();

    if (!selectedDataListId) {
      setError("Please select a data list record.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await axiosClient.post("/box-records", {
        StorageBoxID: Number(id),
        DataListID: Number(selectedDataListId),
        Remarks: remarks,
      });

      setSuccess("Record assigned to box successfully.");
      setSelectedDataListId("");
      setRemarks("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign record");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRecord = async (boxRecordId) => {
    const confirmed = window.confirm("Remove this record from this box?");

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await axiosClient.delete(`/box-records/${boxRecordId}`);

      setSuccess("Record removed from box successfully.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove record");
    }
  };

  const getBackPath = () => {
    if (!box?.CabinetBay) return "/cabinets";

    return `/cabinet-bays/${box.CabinetBay.CabinetBayID}`;
  };

  if (loading) return <p>Loading storage box details...</p>;

  if (!box) {
    return (
      <div>
        <button onClick={() => navigate("/cabinets")} style={styles.backBtn}>
          ← Back to Cabinets
        </button>
        <p>Storage box not found.</p>
      </div>
    );
  }

  const bay = box.CabinetBay;
  const cabinet = bay?.Cabinet;

  return (
    <div>
      <button onClick={() => navigate(getBackPath())} style={styles.backBtn}>
        ← Back to Bay
      </button>

      <h1>{box.BoxCode}</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Cabinet" value={cabinet?.CabinetCode} />
        <SummaryCard title="Side" value={bay?.Side} />
        <SummaryCard title="Level" value={bay?.LevelNumber} />
        <SummaryCard title="Bay" value={bay?.BayNumber} />
        <SummaryCard title="Box No." value={box.BoxNumber} />
        <SummaryCard
          title="Weight"
          value={`${Number(box.EstimatedWeightKg).toFixed(2)} kg`}
        />
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Box Information</h2>

          <Info label="Box Code" value={box.BoxCode} />
          <Info label="Status" value={box.Status} />
          <Info
            label="Department"
            value={box.Department?.DepartmentName || "-"}
          />
          <Info label="Remarks" value={box.Remarks || "-"} />
          <Info
            label="Exact Location"
            value={`${box.BoxCode}`}
          />
        </div>

        <div style={styles.card}>
          <h2>Assign DataList Record</h2>

          <form onSubmit={handleAssignRecord}>
            <label>Search record</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
              placeholder="Search by item no., specific name, or office..."
            />

            <label>DataList Record</label>
            <select
              value={selectedDataListId}
              onChange={(e) => setSelectedDataListId(e.target.value)}
              style={styles.input}
              disabled={loadingDataLists}
              required
            >
              <option value="">
                {loadingDataLists
                  ? "Loading data list..."
                  : "Select record to assign"}
              </option>

              {availableDataLists.map((item) => (
                <option key={item.DataListID} value={item.DataListID}>
                  {item.AgencyUniqueID} - {item.DataListItemNo || "-"} -{" "}
                  {item.DataListSpecificName}
                </option>
              ))}
            </select>

            <label>Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={styles.textarea}
              placeholder="Assignment remarks..."
            />

            <button type="submit" disabled={assigning} style={styles.button}>
              {assigning ? "Assigning..." : "Assign Record"}
            </button>
          </form>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Records Inside This Box</h2>

        {boxRecords.length === 0 ? (
          <p>No records assigned to this box yet.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Office</th>
                  <th style={styles.th}>Item No.</th>
                  <th style={styles.th}>Specific Name</th>
                  <th style={styles.th}>Period Covered</th>
                  <th style={styles.th}>Retention</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {boxRecords.map((record) => (
                  <tr key={record.BoxRecordID}>
                    <td style={styles.td}>
                      {record.DataList?.AgencyForm?.AgencyName ||
                        record.DataList?.AgencyUniqueID ||
                        "-"}
                    </td>
                    <td style={styles.td}>
                      {record.DataList?.DataListItemNo || "-"}
                    </td>
                    <td style={styles.td}>
                      {record.DataList?.DataListSpecificName || "-"}
                    </td>
                    <td style={styles.td}>
                      {record.DataList?.DataListPeriodCover || "-"}
                    </td>
                    <td style={styles.td}>
                      {record.DataList?.DataListRetentionPeriod || "-"}
                    </td>
                    <td style={styles.td}>{record.Remarks || "-"}</td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecord(record.BoxRecordID)}
                        style={styles.deleteButton}
                      >
                        Remove
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
  info: {
    margin: "8px 0",
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
};

export default StorageBoxDetails;