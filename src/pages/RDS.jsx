import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import AccessDenied from "../components/AccessDenied";
import {
  isForbiddenError,
  getApiErrorMessage,
} from "../utils/errorHelpers";

const RDS = () => {
  const [entries, setEntries] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    scheduleTypes: [],
    categories: [],
    years: [],
  });

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [scheduleType, setScheduleType] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState("");

  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [filterResponse, departmentResponse] = await Promise.all([
          axiosClient.get("/rds/filters"),
          axiosClient.get("/departments", {
            params: {
              page: 1,
              limit: 100,
            },
          }),
        ]);

        setFilters(
          filterResponse.data.data || {
            scheduleTypes: [],
            categories: [],
            years: [],
          },
        );

        setDepartments(
          departmentResponse.data?.data?.data || [],
        );
      } catch (err) {
        if (isForbiddenError(err)) {
          setAccessDenied(true);
          return;
        }

        setError(
          getApiErrorMessage(
            err,
            "Failed to load RDS filter options.",
          ),
        );
      }
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    const loadRds = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/rds", {
          params: {
            page,
            limit,
            search: submittedSearch || undefined,
            scheduleType: scheduleType || undefined,
            departmentId: departmentId || undefined,
            category: category || undefined,
            year: year || undefined,
          },
        });

        const result = response.data.data;

        setEntries(result.data || []);
        setMeta(result);
      } catch (err) {
        if (isForbiddenError(err)) {
          setAccessDenied(true);
          return;
        }

        setError(
          getApiErrorMessage(
            err,
            "Failed to load RDS records.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    loadRds();
  }, [
    page,
    limit,
    submittedSearch,
    scheduleType,
    departmentId,
    category,
    year,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const handleReset = () => {
    setSearch("");
    setSubmittedSearch("");
    setScheduleType("");
    setDepartmentId("");
    setCategory("");
    setYear("");
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>
            Records Disposition Schedule
          </h1>

          <p style={styles.subtitle}>
            Search and browse records by Item No. or Records
            Series Title and Description.
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.filterCard}>
        <div style={styles.filterGrid}>
          <div>
            <label style={styles.label}>
              Schedule Type
            </label>

            <select
              value={scheduleType}
              onChange={handleFilterChange(setScheduleType)}
              style={styles.input}
            >
              <option value="">All Schedule Types</option>

              {filters.scheduleTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Department
            </label>

            <select
              value={departmentId}
              onChange={handleFilterChange(setDepartmentId)}
              style={styles.input}
            >
              <option value="">All Departments</option>

              {departments.map((department) => (
                <option
                  key={department.DepartmentID}
                  value={department.DepartmentID}
                >
                  {department.DepartmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Category
            </label>

            <select
              value={category}
              onChange={handleFilterChange(setCategory)}
              style={styles.input}
            >
              <option value="">All Categories</option>

              {filters.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Year
            </label>

            <select
              value={year}
              onChange={handleFilterChange(setYear)}
              style={styles.input}
            >
              <option value="">All Years</option>

              {filters.years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          style={styles.searchRow}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            placeholder="Search Item No. or Records Series Title and Description..."
          />

          <button
            type="submit"
            style={styles.primaryButton}
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={styles.secondaryButton}
          >
            Reset
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.resultHeader}>
          <div>
            <h2 style={styles.resultTitle}>
              RDS Records
            </h2>

            {!loading && (
              <span style={styles.resultCount}>
                {meta?.totalItems ?? entries.length} record(s)
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading RDS records...</p>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Item No.
                    </th>

                    <th style={styles.th}>
                      Records Series Title and Description
                    </th>

                    <th style={styles.th}>
                      Retention Period
                    </th>

                    <th style={styles.th}>
                      Schedule
                    </th>

                    <th style={styles.th}>
                      Department
                    </th>

                    <th style={styles.th}>
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={styles.emptyCell}
                      >
                        No RDS records found.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.SeriesID}>
                        <td style={styles.td}>
                          <strong>
                            {entry.ItemNoID || "-"}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {entry.SeriesName || "-"}
                        </td>

                        <td style={styles.td}>
                          {entry.RetentionPeriod || "-"}
                        </td>

                        <td style={styles.td}>
                          {entry.RecordsSchedule
                            ?.ScheduleType || "-"}
                        </td>

                        <td style={styles.td}>
                          {entry.Department
                            ?.DepartmentName || "-"}
                        </td>

                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEntry(entry)
                            }
                            style={styles.detailsButton}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.pagination}>
              <button
                type="button"
                style={styles.pageButton}
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {meta?.currentPage || 1} of{" "}
                {meta?.totalPages || 1}
              </span>

              <button
                type="button"
                style={styles.pageButton}
                disabled={
                  page >= (meta?.totalPages || 1)
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedEntry && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.itemNumber}>
                  {selectedEntry.ItemNoID || "-"}
                </div>

                <h2 style={styles.modalTitle}>
                  {selectedEntry.SeriesName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div style={styles.detailGrid}>
              <Detail
                label="Retention Period"
                value={selectedEntry.RetentionPeriod}
              />

              <Detail
                label="Category"
                value={selectedEntry.Category}
              />

              <Detail
                label="RDS Year"
                value={selectedEntry.RdsYear}
              />

              <Detail
                label="Schedule Type"
                value={
                  selectedEntry.RecordsSchedule
                    ?.ScheduleType
                }
              />

              <Detail
                label="Schedule"
                value={
                  selectedEntry.RecordsSchedule
                    ?.ScheduleName
                }
              />

              <Detail
                label="Department"
                value={
                  selectedEntry.Department
                    ?.DepartmentName
                }
              />
            </div>

            <div style={styles.specificSection}>
              <h3>
                Specific Records / Descriptions
              </h3>

              {!selectedEntry.Specifics ||
              selectedEntry.Specifics.length === 0 ? (
                <p style={styles.muted}>
                  No specific descriptions under this
                  record.
                </p>
              ) : (
                <div style={styles.specificList}>
                  {selectedEntry.Specifics.map(
                    (specific) => (
                      <div
                        key={specific.SpecificID}
                        style={styles.specificItem}
                      >
                        <div>
                          {specific.SpecificName}
                        </div>

                        <div
                          style={
                            styles.specificRetention
                          }
                        >
                          Retention:{" "}
                          {specific.RetentionPeriod ||
                            "-"}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={styles.detail}>
    <div style={styles.detailLabel}>
      {label}
    </div>

    <div style={styles.detailValue}>
      {value || "-"}
    </div>
  </div>
);

const styles = {
  pageHeader: {
    marginBottom: "18px",
  },

  title: {
    marginBottom: "4px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
  },

  filterCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    marginBottom: "16px",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },

  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
  },

  searchRow: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: "1 1 420px",
    padding: "11px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  },

  primaryButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "10px 18px",
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
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  resultTitle: {
    margin: 0,
  },

  resultCount: {
    color: "#6b7280",
    fontSize: "14px",
  },

  tableWrap: {
    overflowX: "auto",
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
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },

  emptyCell: {
    padding: "24px",
    textAlign: "center",
    color: "#6b7280",
  },

  detailsButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
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

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    background: "#fff",
    borderRadius: "14px",
    width: "min(850px, 100%)",
    maxHeight: "85vh",
    overflowY: "auto",
    padding: "24px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },

  itemNumber: {
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: "4px",
  },

  modalTitle: {
    margin: 0,
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  detail: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  detailLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },

  detailValue: {
    fontWeight: 600,
  },

  specificSection: {
    marginTop: "24px",
  },

  specificList: {
    display: "grid",
    gap: "8px",
  },

  specificItem: {
    padding: "12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  specificRetention: {
    color: "#6b7280",
    fontSize: "13px",
    marginTop: "4px",
  },

  muted: {
    color: "#6b7280",
  },

  error: {
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: "16px",
  },
};

export default RDS;