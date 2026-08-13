import EditorActions from "./EditorActions";
import RdsLookup from "./RdsLookup";

const emptyRecordRow = {
  recordsSeriesOption: "",
  seriesId: null,
  specificId: null,
  itemNo: "",
  recordsSeriesTitleAndDescription: "",
  retentionPeriod: "",
  periodCovered: "",
  remarks: "",
};

const AnnexAEditor = ({
  formData,
  setFormData,
  //seriesList = [],
  isLocked = false,
  requestFormStatus,
  handleChange,
  handleSaveDraft,
  handleSubmitForm,
  saving,
  submitting,
}) => {
  const records = formData.records || [];

  //const recordsSeriesOptions = buildRecordsSeriesOptions(seriesList);

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
  

  const handleRdsSelect = (index, selectedItem) => {
    const titleAndDescription = selectedItem.specificName
      ? `${selectedItem.seriesName} - ${selectedItem.specificName}`
      : selectedItem.seriesName;

    const updatedRecords = records.map((record, recordIndex) => {
      if (recordIndex !== index) {
        return record;
      }

      return {
        ...record,

        recordsSeriesOption: selectedItem.key,

        seriesId: selectedItem.seriesId,
        specificId: selectedItem.specificId,

        itemNo: selectedItem.itemNo || "",

        recordsSeriesTitleAndDescription: titleAndDescription || "",

        retentionPeriod: selectedItem.retentionPeriod || "",
      };
    });

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

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div style={styles.page} className="print-page">
      <h2 style={styles.title}>Request for Authority to Transfer Records</h2>

      <form onSubmit={handleSaveDraft}>
        <div style={styles.formBox} className="print-form">
          <div style={styles.headerGrid}>
            <div style={styles.logoBox}>
              <strong>CITY GOVERNMENT OF MUNTINLUPA</strong>
              <span>CENTRAL RECORDS OFFICE</span>
            </div>

            <div style={styles.field}>
              <label>Date</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
            </div>

            <div style={styles.field}>
              <label>Contact Number</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="contactNumber"
                value={formData.contactNumber || ""}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div style={styles.field}>
              <label>Department / Office</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="departmentOffice"
                value={formData.departmentOffice || ""}
                readOnly
                style={{
                  ...styles.fullInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div style={styles.field}>
              <label>Address</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
            </div>
          </div>

          <div style={styles.timeValue}>
            <strong>Time Value:</strong>

            <label>
              <input
                className="print-input"
                readOnly={isLocked}
                type="radio"
                name="timeValue"
                value="PERMANENT"
                checked={formData.timeValue === "PERMANENT"}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
              Permanent
            </label>

            <label>
              <input
                className="print-input"
                readOnly={isLocked}
                type="radio"
                name="timeValue"
                value="TEMPORARY"
                checked={formData.timeValue === "TEMPORARY"}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
              Temporary
            </label>
          </div>

          <h3>Records Series</h3>

          <div style={styles.tableWrap}>
            <table style={styles.table} className="print-form">
              <thead>
                <tr>
                  <th style={styles.th}>GRDS/ARDS Item No.</th>
                  <th style={styles.th}>
                    Records Series Title and Description
                  </th>
                  <th style={styles.th}>Period Covered</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th} className="print-hide-column">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      <input
                        className="print-input"
                        readOnly={isLocked}
                        value={record.itemNo || ""}
                        readOnly
                        style={{
                          ...styles.tableInput,
                          background: "#f3f4f6",
                        }}
                      />
                    </td>

                    <td style={styles.td}>
                      <RdsLookup
                        value={record.recordsSeriesTitleAndDescription || ""}
                        disabled={isLocked}
                        onSelect={(selectedItem) =>
                          handleRdsSelect(index, selectedItem)
                        }
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        className="print-input"
                        readOnly={isLocked}
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
                        className="print-input"
                        readOnly={isLocked}
                        readOnly={isSubmitted}
                        value={record.remarks || ""}
                        onChange={(e) =>
                          handleRecordChange(index, "remarks", e.target.value)
                        }
                        style={{
                          ...styles.tableInput,
                          background: isSubmitted ? "#f3f4f6" : "#fff",
                        }}
                      />
                    </td>

                    <td style={styles.td} className="print-hide-column">
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

          {!isLocked && (
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
                className="print-input"
                readOnly={isLocked}
                name="locationOfRecords"
                value={formData.locationOfRecords || ""}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
            </div>

            <div style={styles.field}>
              <label>Volume in Cubic Meter</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="volumeInCubicMeter"
                value={formData.volumeInCubicMeter || ""}
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />
            </div>
          </div>

          <div style={styles.twoColumn}>
            <div style={styles.field}>
              <label>Prepared By</label>
              <input
                className="print-input"
                readOnly={isLocked}
                name="preparedBy"
                value={
                  formData.preparedBy ||
                  (isLocked ? "Pending Department Head Approval" : "")
                }
                onChange={handleChange}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
              />

              <label>Prepared Date</label>
              <input
                value={formatDate(formData.preparedDate)}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                }}
                readOnly
              />
              <small>Records Custodian</small>
            </div>

            <div style={styles.field}>
              <label>Approved By</label>
              <input
                className="print-input"
                name="approvedBy"
                value={
                  formData.approvedBy ||
                  (isLocked ? "Pending Department Head Approval" : "")
                }
                readOnly
                style={{
                  ...styles.fullInput,
                  background: "#f3f4f6",
                }}
              />
              <label>Approved Date</label>
              <input
                value={formatDate(formData.approvedDate)}
                style={{
                  ...styles.tableInput,
                  background: isSubmitted ? "#f3f4f6" : "#fff",
                  textAlign: "center",
                }}
                readOnly
              />
              <small>Department Head</small>
            </div>
          </div>
        </div>

        <div className="no-print" style={styles.printActions}>
          <button
            type="button"
            onClick={() => window.print()}
            style={styles.printButton}
          >
            Print Annex A
          </button>
        </div>

        {!isLocked && (
          <EditorActions
            saving={saving}
            submitting={submitting}
            handleSubmitForm={handleSubmitForm}
          />
        )}
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

  printActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },

  printButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AnnexAEditor;
