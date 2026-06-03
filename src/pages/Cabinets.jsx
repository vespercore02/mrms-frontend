import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const Cabinets = () => {
  const navigate = useNavigate();

  const [cabinets, setCabinets] = useState([]);
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get("/cabinets", {
          params: {
            zone: zoneFilter || undefined,
            status: statusFilter || undefined,
          },
        });

        setCabinets(response.data.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load cabinets");
      } finally {
        setLoading(false);
      }
    };

    fetchCabinets();
  }, [zoneFilter, statusFilter]);

  const cabinetSummary = {
    total: cabinets.length,
    zoneA: cabinets.filter((item) => item.Zone === "A").length,
    zoneB: cabinets.filter((item) => item.Zone === "B").length,
    active: cabinets.filter((item) => item.Status === "ACTIVE").length,
    maintenance: cabinets.filter((item) => item.Status === "MAINTENANCE")
      .length,
  };

  return (
    <div>
      <h1>Cabinet Management</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Total Cabinets" value={cabinetSummary.total} />
        <SummaryCard title="Zone A" value={cabinetSummary.zoneA} />
        <SummaryCard title="Zone B" value={cabinetSummary.zoneB} />
        <SummaryCard title="Active" value={cabinetSummary.active} />
        <SummaryCard title="Maintenance" value={cabinetSummary.maintenance} />
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <h2>Cabinet List</h2>

          <div style={styles.filters}>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              style={styles.input}
            >
              <option value="">All Zones</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.input}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading cabinets...</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Cabinet Code</th>
                  <th style={styles.th}>Zone</th>
                  <th style={styles.th}>Floor Row</th>
                  <th style={styles.th}>Floor Column</th>
                  <th style={styles.th}>Levels</th>
                  <th style={styles.th}>Bays</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {cabinets.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan="8">
                      No cabinets found.
                    </td>
                  </tr>
                ) : (
                  cabinets.map((cabinet) => (
                    <tr key={cabinet.CabinetID}>
                      <td style={styles.td}>
                        <strong>{cabinet.CabinetCode}</strong>
                      </td>
                      <td style={styles.td}>Zone {cabinet.Zone}</td>
                      <td style={styles.td}>{cabinet.FloorRow}</td>
                      <td style={styles.td}>{cabinet.FloorColumn}</td>
                      <td style={styles.td}>{cabinet.TotalLevels}</td>
                      <td style={styles.td}>{cabinet.TotalBays}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(cabinet.Status === "ACTIVE"
                              ? styles.activeBadge
                              : cabinet.Status === "MAINTENANCE"
                                ? styles.maintenanceBadge
                                : styles.inactiveBadge),
                          }}
                        >
                          {cabinet.Status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/cabinets/${cabinet.CabinetID}`)
                          }
                          style={styles.button}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
    <h2 style={styles.summaryValue}>{value || 0}</h2>
  </div>
);

const styles = {
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
    fontSize: "28px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filters: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
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
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  activeBadge: {
    background: "#dcfce7",
    color: "#166534",
  },
  maintenanceBadge: {
    background: "#fef3c7",
    color: "#92400e",
  },
  inactiveBadge: {
    background: "#e5e7eb",
    color: "#374151",
  },
  button: {
    padding: "8px 12px",
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
};

export default Cabinets;