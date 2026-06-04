import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getCabinetBayStatusStyle } from "../utils/storageStatusColors";
import AccessDenied from "../components/AccessDenied";
import { isForbiddenError, getApiErrorMessage } from "../utils/errorHelpers";

const CabinetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState(false);

  const [cabinet, setCabinet] = useState(null);
  const [selectedSide, setSelectedSide] = useState("LEFT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCabinet = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(`/cabinets/${id}`);

        setCabinet(response.data.data);
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

    fetchCabinet();
  }, [id]);

  const bays = cabinet?.CabinetBays || [];

  const filteredBays = useMemo(() => {
    return bays.filter((bay) => bay.Side === selectedSide);
  }, [bays, selectedSide]);

  const levels = useMemo(() => {
    const uniqueLevels = [
      ...new Set(filteredBays.map((bay) => bay.LevelNumber)),
    ];

    return uniqueLevels.sort((a, b) => b - a);
  }, [filteredBays]);

  const getBay = (levelNumber, bayNumber) => {
    return filteredBays.find(
      (bay) =>
        Number(bay.LevelNumber) === Number(levelNumber) &&
        Number(bay.BayNumber) === Number(bayNumber),
    );
  };

  if (loading) return <p>Loading cabinet details...</p>;
  if (accessDenied) return <AccessDenied />;

  if (!cabinet) {
    return (
      <div>
        <button onClick={() => navigate("/cabinets")} style={styles.backBtn}>
          ← Back to Cabinets
        </button>
        <p>Cabinet not found.</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/cabinets")} style={styles.backBtn}>
        ← Back to Cabinets
      </button>

      <h1>{cabinet.CabinetCode}</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Zone" value={`Zone ${cabinet.Zone}`} />
        <SummaryCard title="Floor Row" value={cabinet.FloorRow} />
        <SummaryCard title="Floor Column" value={cabinet.FloorColumn} />
        <SummaryCard title="Levels" value={cabinet.TotalLevels} />
        <SummaryCard title="Bays / Level" value={cabinet.TotalBays} />
        <SummaryCard title="Status" value={cabinet.Status} />
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2>Cabinet Map</h2>
            <p style={styles.subtitle}>
              Select side and inspect bay capacity/status.
            </p>
          </div>

          <div style={styles.sideToggle}>
            <button
              type="button"
              onClick={() => setSelectedSide("LEFT")}
              style={{
                ...styles.sideButton,
                ...(selectedSide === "LEFT" ? styles.activeSideButton : {}),
              }}
            >
              LEFT
            </button>

            <button
              type="button"
              onClick={() => setSelectedSide("RIGHT")}
              style={{
                ...styles.sideButton,
                ...(selectedSide === "RIGHT" ? styles.activeSideButton : {}),
              }}
            >
              RIGHT
            </button>
          </div>
        </div>

        <div style={styles.legend}>
          <Legend
            label="Available"
            style={getCabinetBayStatusStyle("AVAILABLE")}
          />
          <Legend
            label="Near Full"
            style={getCabinetBayStatusStyle("NEAR_FULL")}
          />
          <Legend label="Full" style={getCabinetBayStatusStyle("FULL")} />
          <Legend
            label="Overweight"
            style={getCabinetBayStatusStyle("OVERWEIGHT")}
          />
          <Legend
            label="Maintenance"
            style={getCabinetBayStatusStyle("MAINTENANCE")}
          />
        </div>

        <div style={styles.mapWrap}>
          {levels.map((level) => (
            <div key={level} style={styles.levelRow}>
              <div style={styles.levelLabel}>Level {level}</div>

              <div style={styles.bayGrid}>
                {Array.from({ length: cabinet.TotalBays }, (_, index) => {
                  const bayNumber = index + 1;
                  const bay = getBay(level, bayNumber);

                  if (!bay) {
                    return (
                      <div key={bayNumber} style={styles.emptyBay}>
                        B{bayNumber}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={bay.CabinetBayID}
                      type="button"
                      onClick={() =>
                        navigate(`/cabinet-bays/${bay.CabinetBayID}`)
                      }
                      style={{
                        ...styles.bayBox,
                        ...getCabinetBayStatusStyle(bay.Status),
                      }}
                    >
                      <strong>B{bay.BayNumber}</strong>
                      <span>
                        {bay.CurrentBoxes}/{bay.MaxBoxes} boxes
                      </span>
                      <small>
                        {Number(bay.CurrentWeightKg).toFixed(1)} /{" "}
                        {Number(bay.MaxWeightKg).toFixed(0)} kg
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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

const Legend = ({ label, style }) => (
  <div style={styles.legendItem}>
    <span style={{ ...styles.legendDot, ...style }} />
    <span>{label}</span>
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
  subtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
  },
  sideToggle: {
    display: "flex",
    gap: "8px",
  },
  sideButton: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  activeSideButton: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },
  legend: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    margin: "16px 0",
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
  mapWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  levelRow: {
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: "12px",
    alignItems: "center",
  },
  levelLabel: {
    fontWeight: "bold",
    color: "#374151",
  },
  bayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(120px, 1fr))",
    gap: "10px",
  },
  bayBox: {
    minHeight: "90px",
    padding: "10px",
    border: "1px solid transparent",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  emptyBay: {
    minHeight: "90px",
    padding: "10px",
    border: "1px dashed #d1d5db",
    borderRadius: "10px",
    color: "#9ca3af",
  },
  availableBay: {
    background: "#dcfce7",
    color: "#166534",
  },
  nearFullBay: {
    background: "#fef3c7",
    color: "#92400e",
  },
  fullBay: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  overweightBay: {
    background: "#7f1d1d",
    color: "#fff",
  },
  maintenanceBay: {
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

export default CabinetDetails;
