import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import AccessDenied from "../components/AccessDenied";
import { isForbiddenError, getApiErrorMessage } from "../utils/errorHelpers";

const RecordLocations = () => {
  const navigate = useNavigate();

  const [accessDenied, setAccessDenied] = useState(false);

  const [boxRecords, setBoxRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoxRecords = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get("/box-records");

        setBoxRecords(response.data.data || []);
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

    fetchBoxRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const keyword = search.toLowerCase();

    return boxRecords.filter((record) => {
      const dataList = record.DataList;
      const box = record.StorageBox;
      const bay = box?.CabinetBay;
      const cabinet = bay?.Cabinet;

      const matchesSearch =
        !keyword ||
        dataList?.DataListSpecificName?.toLowerCase().includes(keyword) ||
        dataList?.DataListItemNo?.toLowerCase().includes(keyword) ||
        dataList?.DataListPeriodCover?.toLowerCase().includes(keyword) ||
        dataList?.AgencyUniqueID?.toLowerCase().includes(keyword) ||
        dataList?.AgencyForm?.AgencyName?.toLowerCase().includes(keyword) ||
        box?.BoxCode?.toLowerCase().includes(keyword) ||
        bay?.BayCode?.toLowerCase().includes(keyword) ||
        cabinet?.CabinetCode?.toLowerCase().includes(keyword);

      const matchesZone = zoneFilter ? cabinet?.Zone === zoneFilter : true;

      return matchesSearch && matchesZone;
    });
  }, [boxRecords, search, zoneFilter]);

  if (accessDenied) return <AccessDenied />;

  return (
    <div>
      <h1>Record Locations</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <h2>Search Record Location</h2>

        <div style={styles.filters}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            placeholder="Search record, office, item no., box code, cabinet..."
          />

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            style={styles.input}
          >
            <option value="">All Zones</option>
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
          </select>
        </div>

        {loading ? (
          <p>Loading record locations...</p>
        ) : filteredRecords.length === 0 ? (
          <p>No record locations found.</p>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Office</th>
                  <th style={styles.th}>Item No.</th>
                  <th style={styles.th}>Record Title</th>
                  <th style={styles.th}>Period</th>
                  <th style={styles.th}>Box Code</th>
                  <th style={styles.th}>Cabinet</th>
                  <th style={styles.th}>Side</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>Bay</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const dataList = record.DataList;
                  const box = record.StorageBox;
                  const bay = box?.CabinetBay;
                  const cabinet = bay?.Cabinet;

                  return (
                    <tr key={record.BoxRecordID}>
                      <td style={styles.td}>
                        {dataList?.AgencyForm?.AgencyName ||
                          dataList?.AgencyUniqueID ||
                          "-"}
                      </td>
                      <td style={styles.td}>
                        {dataList?.DataListItemNo || "-"}
                      </td>
                      <td style={styles.td}>
                        <strong>{dataList?.DataListSpecificName || "-"}</strong>
                      </td>
                      <td style={styles.td}>
                        {dataList?.DataListPeriodCover || "-"}
                      </td>
                      <td style={styles.td}>
                        <strong>{box?.BoxCode || "-"}</strong>
                      </td>
                      <td style={styles.td}>{cabinet?.CabinetCode || "-"}</td>
                      <td style={styles.td}>{bay?.Side || "-"}</td>
                      <td style={styles.td}>{bay?.LevelNumber || "-"}</td>
                      <td style={styles.td}>{bay?.BayNumber || "-"}</td>
                      <td style={styles.td}>
                        {box?.StorageBoxID && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/storage-boxes/${box.StorageBoxID}`)
                            }
                            style={styles.button}
                          >
                            View Box
                          </button>
                        )}
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

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  filters: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  searchInput: {
    flex: 1,
    minWidth: "280px",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  },
  input: {
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
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
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  button: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
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

export default RecordLocations;
