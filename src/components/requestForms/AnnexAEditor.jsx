import EditorActions from "./EditorActions";

const emptyRecordRow = {
  itemNo: "",
  recordsSeriesTitleAndDescription: "",
  periodCovered: "",
  remarks: "",
};

const AnnexAEditor = ({
  formData,
  setFormData,
  seriesList = [],
  requestFormStatus,
  handleChange,
  handleSaveDraft,
  handleSubmitForm,
  saving,
  submitting,
}) => {
  const records = formData.records || [];

  const isSubmitted = requestFormStatus === "SUBMITTED";

  const handleRecordChange = (index, field, value) => {
    const updatedRecords = records.map((record, recordIndex) =>
      recordIndex === index
        ? {
            ...record,
            [field]: value,
          }
        : record,
    );

    setFormData((prev) => ({
      ...prev,
      records: updatedRecords,
    }));
  };

  const handleSeriesSelect = (index, seriesId) => {
    const selectedSeries = seriesList.find(
      (series) => String(series.SeriesID) === String(seriesId),
    );

    const updatedRecords = records.map((record, recordIndex) =>
      recordIndex === index
        ? {
            ...record,
            seriesId,
            itemNo: selectedSeries?.ItemNoID || "",
            recordsSeriesTitleAndDescription: selectedSeries?.SeriesName || "",
          }
        : record,
    );

    setFormData((prev) => ({
      ...prev,
      records: updatedRecords,
    }));
  };

  const addRecordRow = () => {
    setFormData((prev) => ({
      ...prev,
      records: [...records, emptyRecordRow],
    }));
  };

  const removeRecordRow = (index) => {
    if (records.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      records: records.filter((_, recordIndex) => recordIndex !== index),
    }));
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Request for Authority to Transfer Records</h2>

      <form onSubmit={handleSaveDraft}>
        <div style={styles.formBox}>
          <div style={styles.headerGrid}>
            <div style={styles.logoBox}>
              <strong>CITY GOVERNMENT OF MUNTINLUPA</strong>
              <span>CENTRAL RECORDS OFFICE</span>
            </div>

            <div style={styles.field}>
              <label>Date</label>
              <input
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
            </div>

            <div style={styles.field}>
              <label>Contact Number</label>
              <input
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div style={styles.field}>
              <label>Department / Office</label>
              <input
                name="departmentOffice"
                value={formData.departmentOffice || ""}
                readOnly
                style={{
                  ...styles.fullInput,
                  background: "#f3f4f6",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div style={styles.field}>
              <label>Address</label>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
            </div>
          </div>

          <div style={styles.timeValue}>
            <strong>Time Value:</strong>

            <label>
              <input
                type="radio"
                name="timeValue"
                value="PERMANENT"
                checked={formData.timeValue === "PERMANENT"}
                onChange={handleChange}
              />
              Permanent
            </label>

            <label>
              <input
                type="radio"
                name="timeValue"
                value="TEMPORARY"
                checked={formData.timeValue === "TEMPORARY"}
                onChange={handleChange}
              />
              Temporary
            </label>
          </div>

          <h3>Records Series</h3>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>GRDS/ARDS Item No.</th>
                  <th style={styles.th}>
                    Records Series Title and Description
                  </th>
                  <th style={styles.th}>Period Covered</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      <input
                        value={record.itemNo || ""}
                        readOnly
                        style={{
                          ...styles.tableInput,
                          background: "#f3f4f6",
                        }}
                      />
                    </td>

                    <td style={styles.td}>
                      {isSubmitted ? (
                        <div style={styles.readOnlyCell}>
                          {record.recordsSeriesTitleAndDescription || "-"}
                        </div>
                      ) : (
                        <select
                          value={record.seriesId || ""}
                          onChange={(e) =>
                            handleSeriesSelect(index, e.target.value)
                          }
                          style={styles.tableInput}
                        >
                          <option value="">Select records series</option>
                          {seriesList.map((series) => (
                            <option
                              key={series.SeriesID}
                              value={series.SeriesID}
                            >
                              {series.ItemNoID ? `${series.ItemNoID} - ` : ""}
                              {series.SeriesName}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td style={styles.td}>
                      <input
                        value={record.periodCovered || ""}
                        readOnly={isSubmitted}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "periodCovered",
                            e.target.value,
                          )
                        }
                        style={{
                          ...styles.tableInput,
                          background: isSubmitted ? "#f3f4f6" : "#fff",
                        }}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        value={record.remarks || ""}
                        onChange={(e) =>
                          handleRecordChange(index, "remarks", e.target.value)
                        }
                        style={styles.tableInput}
                      />
                    </td>

                    <td style={styles.td}>
                      {!isSubmitted && (
                        <button
                          type="button"
                          onClick={() => removeRecordRow(index)}
                          style={styles.removeButton}
                          disabled={records.length === 1}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isSubmitted && (
            <button
              type="button"
              onClick={addRecordRow}
              style={styles.addButton}
            >
              + Add Record Row
            </button>
          )}

          <div style={styles.twoColumn}>
            <div style={styles.field}>
              <label>Location of Records</label>
              <input
                name="locationOfRecords"
                value={formData.locationOfRecords || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
            </div>

            <div style={styles.field}>
              <label>Volume in Cubic Meter</label>
              <input
                name="volumeInCubicMeter"
                value={formData.volumeInCubicMeter || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div style={styles.field}>
              <label>Prepared By</label>
              <input
                name="preparedBy"
                value={formData.preparedBy || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
              <small>Records Custodian</small>
            </div>

            <div style={styles.field}>
              <label>Approved By</label>
              <input
                name="approvedBy"
                value={formData.approvedBy || ""}
                onChange={handleChange}
                style={styles.fullInput}
              />
              <small>Department Head</small>
            </div>
          </div>
        </div>

        <EditorActions
          saving={saving}
          submitting={submitting}
          handleSubmitForm={handleSubmitForm}
        />
      </form>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
  },
  formBox: {
    background: "#fff",
    border: "1px solid #111827",
    padding: "16px",
    borderRadius: "8px",
  },
  headerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  logoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    justifyContent: "center",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  timeValue: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
  },
  tableWrap: {
    overflowX: "auto",
    marginBottom: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    border: "1px solid #111827",
    padding: "8px",
    background: "#f9fafb",
    fontSize: "13px",
  },
  td: {
    border: "1px solid #111827",
    padding: "6px",
    verticalAlign: "top",
  },

  addButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "16px",
  },
  removeButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "6px",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },

  field: {
    minWidth: 0,
  },

  fullInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
  },

  tableInput: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: "6px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
  },

  tableTextarea: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    minHeight: "70px",
    padding: "6px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    resize: "vertical",
  },

  readOnlyCell: {
    minHeight: "34px",
    padding: "8px",
    background: "#f3f4f6",
    borderRadius: "4px",
  },

  submittedNotice: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "bold",
  },
};

export default AnnexAEditor;
