import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getUser } from "../utils/auth";

const emptyForm = {
  RequestTypeID: "",
  RequestType: "",
  DepartmentID: "",
  Remarks: "",
};

const CreateRequestV2 = () => {
  const navigate = useNavigate();
  const user = getUser();

  const initialForm = {
    ...emptyForm,
    DepartmentID:
      ["Department Head", "Department Custodian"].includes(
        user?.Role?.RoleName,
      ) && user?.DepartmentID
        ? String(user.DepartmentID)
        : "",
  };

  const [form, setForm] = useState(initialForm);
  const [requestTypes, setRequestTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loadingRequestTypes, setLoadingRequestTypes] = useState(true);
  const [loadingAgencies, setLoadingAgencies] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roleName = user?.Role?.RoleName;
  console.log("Logged user:", user);

  const isDepartmentUser = ["Department Head", "Department Custodian"].includes(
    roleName,
  );

  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        const response = await axiosClient.get("/request-v2/request-types");
        setRequestTypes(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load request types");
      } finally {
        setLoadingRequestTypes(false);
      }
    };

    fetchRequestTypes();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingAgencies(true);

        const response = await axiosClient.get("/departments", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const result = response.data.data;

        console.log(result);

        const departmentList = Array.isArray(result)
          ? result
          : result?.data || result?.rows || [];

        console.log(
          "Department IDs:",
          departmentList.map((d) => ({
            id: d.DepartmentID,
            name: d.DepartmentName,
          })),
        );

        setDepartments(departmentList);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load departments");
        setDepartments([]);
      } finally {
        setLoadingAgencies(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "RequestTypeID") {
      const selectedType = requestTypes.find(
        (item) => Number(item.RequestTypeID) === Number(value),
      );

      setForm((prev) => ({
        ...prev,
        RequestTypeID: value,
        RequestType: selectedType?.RequestTypeCode || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.RequestTypeID) {
      setError("Please select a request type.");
      return false;
    }

    if (!form.DepartmentID) {
      setError("Please select an office / agency.");
      return false;
    }

    if (!user?.UserID) {
      setError("User session expired. Please login again.");
      return false;
    }

    return true;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        RequestTypeID: Number(form.RequestTypeID),
        RequestType: form.RequestType,
        DepartmentID: Number(form.DepartmentID),
        RequestedBy: user.UserID,
        Remarks: form.Remarks,
        Status: "DRAFT",
      };

      const response = await axiosClient.post("/requests", payload);

      const createdRequest = response.data.data;

      setSuccess("Draft request created successfully.");

      navigate(`/requests/${createdRequest.RequestID}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create draft request");
    } finally {
      setSaving(false);
    }
  };

  if (isDepartmentUser && !user?.DepartmentID) {
    setError("Your account has no assigned department. Please contact Admin.");
    return false;
  }

  return (
    <div style={styles.page}>
      <h1>Create Request</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.card}>
        <h2>New Draft Request</h2>
        <p style={styles.muted}>
          Select a request type. Required forms will be prepared automatically.
        </p>

        <form onSubmit={handleSaveDraft}>
          <label>Request Type</label>
          <select
            name="RequestTypeID"
            value={form.RequestTypeID}
            onChange={handleChange}
            style={styles.input}
            disabled={loadingRequestTypes}
            required
          >
            <option value="">
              {loadingRequestTypes
                ? "Loading request types..."
                : "Select request type"}
            </option>

            {requestTypes.map((type) => (
              <option key={type.RequestTypeID} value={type.RequestTypeID}>
                {type.RequestTypeName}
              </option>
            ))}
          </select>

          {form.RequestType && (
            <div style={styles.infoBox}>
              <strong>Selected Code:</strong> {form.RequestType}
            </div>
          )}

          <label>Department / Office</label>

          <select
            name="DepartmentID"
            value={form.DepartmentID}
            onChange={handleChange}
            style={styles.input}
            disabled={
              loadingAgencies || (isDepartmentUser && !!user?.DepartmentID)
            }
            required
          >
            <option value="">
              {loadingAgencies ? "Loading offices..." : "Select office"}
            </option>

            {departments.map((department, index) => {
              const departmentId =
                department.DepartmentID ||
                department.id ||
                department.ID ||
                index;

              const departmentName =
                department.DepartmentName ||
                department.Name ||
                department.name ||
                department.DepartmentCode ||
                `Department ${departmentId}`;

              return (
                <option key={departmentId} value={String(departmentId)}>
                  {departmentName}
                </option>
              );
            })}
          </select>

          <label>Remarks</label>
          <textarea
            name="Remarks"
            value={form.Remarks}
            onChange={handleChange}
            style={styles.textarea}
            placeholder="Optional notes for this request..."
          />

          <div style={styles.actions}>
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/requests")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <h2>How this works</h2>

        <ol style={styles.list}>
          <li>Create a draft request.</li>
          <li>System auto-creates required forms based on request type.</li>
          <li>User fills Annex A or required forms.</li>
          <li>Request can only be submitted after required forms are ready.</li>
        </ol>
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
    marginBottom: "16px",
    maxWidth: "760px",
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
    minHeight: "100px",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    margin: "6px 0 14px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },
  muted: {
    color: "#6b7280",
  },
  infoBox: {
    padding: "10px",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "8px",
    marginBottom: "14px",
  },
  list: {
    paddingLeft: "20px",
    color: "#374151",
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

  page: {
    maxWidth: "820px",
    margin: "0 auto",
  },
};

export default CreateRequestV2;
