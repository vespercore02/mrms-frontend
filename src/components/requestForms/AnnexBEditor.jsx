const AnnexBEditor = ({ formData }) => {
  const records = formData.records || [];

  return (
    <div style={styles.page} className="print-page">
      <div style={styles.generatedNotice} className="no-print">
        Annex B is auto-generated from Annex A. No manual input is required.
      </div>
      <div className="no-print" style={styles.printActions}>
        <button
          type="button"
          onClick={() => window.print()}
          style={styles.printButton}
        >
          Print Annex B
        </button>
      </div>

      <h2 style={styles.title}>Records Transmittal Form</h2>

      <div style={styles.formBox} className="print-form">
        <div style={styles.headerGrid}>
          <div style={styles.logoBox}>
            <strong>CITY GOVERNMENT OF MUNTINLUPA</strong>
            <span>CENTRAL RECORDS OFFICE</span>
          </div>

          <Info
            label="CRO Authority Number"
            value={formData.croAuthorityNumber || ""}
          />
        </div>

        <div style={styles.twoColumn}>
          <Info
            label="Department / Office"
            value={formData.departmentOffice || "-"}
          />
          <Info
            label="Records Officer / Custodian"
            value={formData.recordsOfficer || "-"}
          />
        </div>

        <div style={styles.twoColumn}>
          <Info
            label="Department Head / Head of Office"
            value={
              formData.departmentHead || "Pending Department Head Approval"
            }
          />
          <Info
            label="Restriction on Access"
            value={
              formData.accessRestriction === "RESTRICTED"
                ? "Restricted"
                : "No Restriction"
            }
          />
        </div>

        <div style={styles.note}>
          Amenable to any findings and / or discrepancies / inconsistence in the
          listings, label, volume, physical state of the records transferred.
        </div>

        <table style={styles.table} className="print-table">
          <thead>
            <tr>
              <th style={styles.th}>Box Number</th>
              <th style={styles.th}>Records Series Title and Description</th>
              <th style={styles.th}>Inclusive Dates</th>
              <th style={styles.th}>Volume</th>
              <th style={styles.th}>Disposal Authority</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan="5">
                  No records generated from Annex A.
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={index}>
                  <td style={styles.td}>{record.boxNumber || "-"}</td>
                  <td style={styles.td}>{record.recordsSeries || "-"}</td>
                  <td style={styles.td}>{record.inclusiveDates || "-"}</td>
                  <td style={styles.td}>{record.volume || "-"}</td>
                  <td style={styles.td}>{record.disposalAuthority || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={styles.croHeader}>
          TO BE ACCOMPLISHED AT THE CENTRAL RECORDS STORAGE CENTER
        </div>

        <div style={styles.fourColumn}>
          <Info
            label="Accession Number"
            value={formData.accessionNumber || ""}
          />
          <Info label="Received By" value={formData.receivedBy || ""} />
          <Info label="Position" value={formData.receivedPosition || ""} />
          <Info label="Date Received" value={formData.dateReceived || ""} />
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div style={styles.infoBlock}>
    <strong>{label}</strong>
    <div style={styles.infoValue}>{value || "-"}</div>
  </div>
);

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
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
  formBox: {
    background: "#fff",
    border: "1px solid #111827",
    padding: "16px",
    borderRadius: "8px",
  },
  headerGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "12px",
    borderBottom: "1px solid #111827",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  logoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    justifyContent: "center",
    textAlign: "center",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  fourColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginTop: "12px",
  },
  infoBlock: {
    border: "1px solid #111827",
    padding: "10px",
    minHeight: "54px",
  },
  infoValue: {
    marginTop: "8px",
    minHeight: "20px",
  },
  note: {
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "bold",
    padding: "8px",
    border: "1px solid #111827",
    marginBottom: "0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    border: "1px solid #111827",
    padding: "8px",
    background: "#0f7fc4",
    color: "#fff",
    fontSize: "13px",
    textAlign: "center",
  },
  td: {
    border: "1px solid #111827",
    padding: "8px",
    minHeight: "40px",
    verticalAlign: "top",
  },
  croHeader: {
    marginTop: "0",
    padding: "6px",
    background: "#6b7280",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    border: "1px solid #111827",
  },

  generatedNotice: {
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#1e40af",
    fontWeight: "bold",
  },
};

export default AnnexBEditor;
