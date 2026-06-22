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
  handleChange,
  handleSaveDraft,
  handleSubmitForm,
  saving,
  submitting,
}) => {
  const records = formData.records?.length ? formData.records : [emptyRecordRow];

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
      <h2 style={styles.title}>
        Request for Authority to Transfer Records
      </h2>

      <form onSubmit={handleSaveDraft}>
        <div style={styles.formBox}>
          <div style={styles.headerGrid}>
            <div style={styles.logoBox}>
              <strong>CITY GOVERNMENT OF MUNTINLUPA</strong>
              <span>CENTRAL RECORDS OFFICE</span>
            </div>

            <div>
              <label>Date</label>
              <input
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label>Contact Number</label>
              <input
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div>
              <label>Department / Office</label>
              <input
                name="departmentOffice"
                value={formData.departmentOffice || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label>Address</label>
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                style={styles.input}
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
                        onChange={(e) =>
                          handleRecordChange(index, "itemNo", e.target.value)
                        }
                        style={styles.tableInput}
                      />
                    </td>

                    <td style={styles.td}>
                      <textarea
                        value={
                          record.recordsSeriesTitleAndDescription || ""
                        }
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "recordsSeriesTitleAndDescription",
                            e.target.value,
                          )
                        }
                        style={styles.tableTextarea}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        value={record.periodCovered || ""}
                        onChange={(e) =>
                          handleRecordChange(
                            index,
                            "periodCovered",
                            e.target.value,
                          )
                        }
                        style={styles.tableInput}
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
                      <button
                        type="button"
                        onClick={() => removeRecordRow(index)}
                        style={styles.removeButton}
                        disabled={records.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addRecordRow} style={styles.addButton}>
            + Add Record Row
          </button>

          <div style={styles.twoColumn}>
            <div>
              <label>Location of Records</label>
              <input
                name="locationOfRecords"
                value={formData.locationOfRecords || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label>Volume in Cubic Meter</label>
              <input
                name="volumeInCubicMeter"
                value={formData.volumeInCubicMeter || ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div>
              <label>Prepared By</label>
              <input
                name="preparedBy"
                value={formData.preparedBy || ""}
                onChange={handleChange}
                style={styles.input}
              />
              <small>Records Custodian</small>
            </div>

            <div>
              <label>Approved By</label>
              <input
                name="approvedBy"
                value={formData.approvedBy || ""}
                onChange={handleChange}
                style={styles.input}
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
  tableInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
  },
  tableTextarea: {
    width: "100%",
    minHeight: "60px",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
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
};

export default AnnexAEditor;