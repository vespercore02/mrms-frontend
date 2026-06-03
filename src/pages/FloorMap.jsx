import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getCabinetStatusStyle } from "../utils/storageStatusColors";

const FloorMap = () => {
  const navigate = useNavigate();

  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get("/cabinets");

        setCabinets(response.data.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load floor map");
      } finally {
        setLoading(false);
      }
    };

    fetchCabinets();
  }, []);

  const zoneA = useMemo(
    () => cabinets.filter((cabinet) => cabinet.Zone === "A"),
    [cabinets],
  );

  const zoneB = useMemo(
    () => cabinets.filter((cabinet) => cabinet.Zone === "B"),
    [cabinets],
  );

  const groupByRow = (items) => {
    return items.reduce((groups, cabinet) => {
      const row = cabinet.FloorRow;

      if (!groups[row]) {
        groups[row] = [];
      }

      groups[row].push(cabinet);

      return groups;
    }, {});
  };

  const renderZone = (title, items, columns) => {
    const groupedRows = groupByRow(items);
    const rows = Object.keys(groupedRows).sort((a, b) => Number(a) - Number(b));

    return (
      <div style={styles.zoneCard}>
        <div style={styles.zoneHeader}>
          <div>
            <h2>{title}</h2>
            <p style={styles.subtitle}>
              {items.length} cabinets • 2 rows × {columns} cabinets
            </p>
          </div>
        </div>

        <div style={styles.zoneRows}>
          {rows.map((row) => {
            const rowCabinets = groupedRows[row].sort(
              (a, b) => a.FloorColumn - b.FloorColumn,
            );

            return (
              <div key={row} style={styles.floorRow}>
                <div style={styles.rowLabel}>Row {row}</div>

                <div
                  style={{
                    ...styles.cabinetGrid,
                    gridTemplateColumns: `repeat(${columns}, minmax(90px, 1fr))`,
                  }}
                >
                  {rowCabinets.map((cabinet) => (
                    <button
                      key={cabinet.CabinetID}
                      type="button"
                      onClick={() => navigate(`/cabinets/${cabinet.CabinetID}`)}
                      style={{
                        ...styles.cabinetBlock,
                        ...getCabinetStatusStyle(cabinet.Status),
                      }}
                    >
                      <strong>{cabinet.CabinetCode}</strong>
                      <span>Col {cabinet.FloorColumn}</span>
                      <small>{cabinet.Status}</small>
                    </button>
                  ))}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <p>Loading floor map...</p>;

  return (
    <div>
      <h1>Storage Floor Map</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Total Cabinets" value={cabinets.length} />
        <SummaryCard title="Zone A" value={zoneA.length} />
        <SummaryCard title="Zone B" value={zoneB.length} />
        <SummaryCard
          title="Active"
          value={cabinets.filter((item) => item.Status === "ACTIVE").length}
        />
        <SummaryCard
          title="Maintenance"
          value={
            cabinets.filter((item) => item.Status === "MAINTENANCE").length
          }
        />
      </div>

      <div style={styles.legend}>
        <Legend label="Active" style={styles.activeCabinet} />
        <Legend label="Maintenance" style={styles.maintenanceCabinet} />
        <Legend label="Inactive" style={styles.inactiveCabinet} />
      </div>

      {renderZone("Zone A", zoneA, 8)}
      {renderZone("Zone B", zoneB, 10)}
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div style={styles.summaryCard}>
    <p style={styles.summaryTitle}>{title}</p>
    <h2 style={styles.summaryValue}>{value || 0}</h2>
  </div>
);

const Legend = ({ label, style }) => (
  <div style={styles.legendItem}>
    <span style={{ ...styles.legendDot, ...style }} />
    <span>{label}</span>
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
  legend: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
  },
  legendDot: {
    width: "14px",
    height: "14px",
    borderRadius: "999px",
    display: "inline-block",
  },
  zoneCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    marginBottom: "16px",
  },
  zoneHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
  },
  zoneRows: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "16px",
  },
  floorRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr",
    gap: "12px",
    alignItems: "center",
  },
  rowLabel: {
    fontWeight: "bold",
    color: "#374151",
  },
  cabinetGrid: {
    display: "grid",
    gap: "10px",
  },
  cabinetBlock: {
    minHeight: "90px",
    padding: "12px",
    border: "1px solid transparent",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  activeCabinet: {
    background: "#dcfce7",
    color: "#166534",
  },
  maintenanceCabinet: {
    background: "#fef3c7",
    color: "#92400e",
  },
  inactiveCabinet: {
    background: "#e5e7eb",
    color: "#374151",
  },
  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: "16px",
  },
};

export default FloorMap;
