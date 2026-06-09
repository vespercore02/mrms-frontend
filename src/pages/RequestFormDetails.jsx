import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const defaultAnnexAData = {
  departmentOffice: "",
  locationOfRecords: "",
  recordsDescription: "",
  inclusiveDates: "",
  volumeInCubicMeter: "",
  timeValue: "TEMPORARY",
  remarks: "",
};

const RequestFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requestForm, setRequestForm] = useState(null);
  const [formData, setFormData] = useState(defaultAnnexAData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequestForm = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(`/request-forms/${id}`);
      const data = response.data.data;

      setRequestForm(data);

      if (data.FormData) {
        setFormData({
          ...defaultAnnexAData,
          ...data.FormData,
        });
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadRequestForm = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(`/request-forms/${id}`);
        const data = response.data.data;

        if (!isMounted) return;

        setRequestForm(data);

        if (data.FormData) {
          setFormData({
            ...defaultAnnexAData,
            ...data.FormData,
          });
        }

        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load request form");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRequestForm();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axiosClient.put(`/request-forms/${id}`, {
        FormData: formData,
        Status: "DRAFT",
        Remarks: formData.remarks,
      });

      setSuccess("Form draft saved successfully.");
      await fetchRequestForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForm = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await axiosClient.put(`/request-forms/${id}`, {
        FormData: formData,
        Remarks: formData.remarks,
      });

      await axiosClient.patch(`/request-forms/${id}/submit`);

      setSuccess("Form submitted successfully.");
      await fetchRequestForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  const getBackPath = () => {
    if (!requestForm?.RequestID) return "/requests";
    return `/requests/${requestForm.RequestID}`;
  };

  if (loading) return <p>Loading request form...</p>;

  if (!requestForm) {
    return (
      <div>
        <button onClick={() => navigate("/requests")} style={styles.backBtn}>
          ← Back to Requests
        </button>
        <p>Request form not found.</p>
      </div>
    );
  }

  const formCode = requestForm.RequestFormType?.FormCode;

  return (
    <div>
      <button onClick={() => navigate(getBackPath())} style={styles.backBtn}>
        ← Back to Request
      </button>

      <h1>{requestForm.RequestFormType?.FormName || "Request Form"}</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.summaryGrid}>
        <SummaryCard title="Form Code" value={formCode} />
        <SummaryCard
          title="Category"
          value={requestForm.RequestFormType?.FormCategory}
        />
        <SummaryCard title="Status" value={requestForm.Status} />
        <SummaryCard title="Request ID" value={requestForm.RequestID} />
      </div>

      {formCode === "ANNEX_A" ? (
        <div style={styles.card}>
          <h2>Annex A Draft</h2>
          <p style={styles.muted}>
            Request for Authority to Transfer Non-Current Records.
          </p>

          <form onSubmit={handleSaveDraft}>
            <label>Department / Office</label>
            <input
              name="departmentOffice"
              value={formData.departmentOffice}
              onChange={handleChange}
              style={styles.input}
              placeholder="Accounting Office"
              required
            />

            <label>Location of Records</label>
            <input
              name="locationOfRecords"
              value={formData.locationOfRecords}
              onChange={handleChange}
              style={styles.input}
              placeholder="Storage room / office location"
              required
            />

            <label>Records Description</label>
            <textarea
              name="recordsDescription"
              value={formData.recordsDescription}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Brief description of records..."
              required
            />

            <label>Inclusive Dates</label>
            <input
              name="inclusiveDates"
              value={formData.inclusiveDates}
              onChange={handleChange}
              style={styles.input}
              placeholder="2020-2024"
            />

            <label>Volume in Cubic Meter</label>
            <input
              type="number"
              step="0.01"
              name="volumeInCubicMeter"
              value={formData.volumeInCubicMeter}
              onChange={handleChange}
              style={styles.input}
              placeholder="1.25"
            />

            <label>Time Value</label>
            <select
              name="timeValue"
              value={formData.timeValue}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="TEMPORARY">Temporary</option>
              <option value="PERMANENT">Permanent</option>
            </select>

            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Additional remarks..."
            />

            <div style={styles.actions}>
              <button type="submit" disabled={saving} style={styles.button}>
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={submitting}
                style={styles.submitButton}
              >
                {submitting ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={styles.card}>
          <h2>Generic Form Editor</h2>
          <p style={styles.muted}>
            This form editor is not yet customized. For now, you can view basic
            metadata only.
          </p>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div style={styles.summaryCard}>
    <p style={styles.summaryTitle}>{title}</p>
    <h3 style={styles.summaryValue}>{value || "-"}</h3>
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
    maxWidth: "800px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 14px",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 14px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
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
  success: {
    padding: "12px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    marginBottom: "16px",
  },
};

export default RequestFormDetails;
