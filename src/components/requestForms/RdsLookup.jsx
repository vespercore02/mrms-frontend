import { useState } from "react";
import axiosClient from "../../api/axiosClient";

const RdsLookup = ({ value = "", onSelect, disabled = false }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      setResults([]);
      setSearched(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await axiosClient.get("/rds", {
        params: {
          page: 1,
          limit: 20,
          search: trimmedSearch,
        },
      });

      const result = response.data?.data;
      const entries = result?.data || [];

      const flattenedResults = entries.flatMap((series) => {
        const specifics = series.Specifics || [];

        /*
         * Preserve the old Annex A behavior:
         *
         * 1. Series without Specific records
         *    -> selectable as the Series itself
         *
         * 2. Series with Specific records
         *    -> each Specific becomes a selectable result
         */
        if (specifics.length === 0) {
          return [
            {
              key: `series:${series.SeriesID}`,
              seriesId: series.SeriesID,
              specificId: null,
              itemNo: series.ItemNoID || "",
              seriesName: series.SeriesName || "",
              specificName: null,
              retentionPeriod: series.RetentionPeriod || "",
              scheduleType: series.RecordsSchedule?.ScheduleType || "",
            },
          ];
        }

        return specifics.map((specific) => ({
          key: `specific:${specific.SpecificID}`,
          seriesId: series.SeriesID,
          specificId: specific.SpecificID,
          itemNo: series.ItemNoID || "",
          seriesName: series.SeriesName || "",
          specificName: specific.SpecificName || "",
          retentionPeriod:
            specific.RetentionPeriod || series.RetentionPeriod || "",
          scheduleType: series.RecordsSchedule?.ScheduleType || "",
        }));
      });

      setResults(flattenedResults);
    } catch (err) {
      console.error("Failed to search RDS:", err);

      setResults([]);
      setError(
        err.response?.data?.message ||
          "Failed to search Records Disposition Schedule.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (typeof onSelect === "function") {
      onSelect(item);
    }

    setResults([]);
    setSearch("");
    setSearched(false);
    setError("");
  };

  const buildTitleAndDescription = (item) => {
    if (item.specificName) {
      return `${item.seriesName} - ${item.specificName}`;
    }

    return item.seriesName;
  };

  return (
    <div style={styles.wrapper}>
      {value && <div style={styles.selectedValue}>{value}</div>}

      {!disabled && (
        <>
          <div style={styles.searchRow}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search RDS..."
              style={styles.searchInput}
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              style={{
                ...styles.searchButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {!loading && searched && !error && results.length === 0 && (
            <div style={styles.empty}>No matching RDS record found.</div>
          )}

          {results.length > 0 && (
            <div style={styles.results}>
              {results.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelect(item)}
                  style={styles.resultButton}
                >
                  <div style={styles.resultHeader}>
                    <strong>{item.itemNo || "-"}</strong>

                    {item.scheduleType && (
                      <span style={styles.scheduleBadge}>
                        {item.scheduleType}
                      </span>
                    )}
                  </div>
                  <div style={styles.seriesName}>{item.seriesName || "-"}</div>
                  {item.specificName && (
                    <div style={styles.specificName}>{item.specificName}</div>
                  )}
                  {item.retentionPeriod && (
                    <div style={styles.retention}>
                      Retention: {item.retentionPeriod}
                    </div>
                  )}
                  <div style={styles.selectHint}>
                    Select: {buildTitleAndDescription(item)}
                  </div>
                  ;
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    position: "relative",
  },

  selectedValue: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "42px",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#f3f4f6",
    marginBottom: "6px",
    lineHeight: 1.35,
  },

  searchRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "6px",
    width: "100%",
  },

  searchInput: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
  },

  searchButton: {
    padding: "8px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  results: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 30,
    marginTop: "6px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    maxHeight: "320px",
    overflowY: "auto",
    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
  },

  resultButton: {
    display: "block",
    width: "100%",
    padding: "10px",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },

  seriesName: {
    fontWeight: 600,
    color: "#111827",
    lineHeight: 1.3,
  },

  specificName: {
    marginTop: "3px",
    paddingLeft: "8px",
    color: "#374151",
    fontSize: "13px",
    lineHeight: 1.3,
  },

  retention: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "12px",
  },

  scheduleBadge: {
    padding: "2px 6px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 600,
  },

  

  selectHint: {
    marginTop: "6px",
    color: "#2563eb",
    fontSize: "12px",
  },

  empty: {
    marginTop: "6px",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    background: "#f9fafb",
    color: "#6b7280",
    fontSize: "13px",
  },

  error: {
    marginTop: "6px",
    padding: "8px",
    borderRadius: "4px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
  },
};

export default RdsLookup;
