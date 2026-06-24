import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../utils/auth";
import axiosClient from "../api/axiosClient";
import AnnexAEditor from "../components/requestForms/AnnexAEditor";
import AnnexBEditor from "../components/requestForms/AnnexBEditor";
import GenericFormEditor from "../components/requestForms/GenericFormEditor";

const defaultAnnexAData = {
  date: "",
  contactNumber: "",
  departmentOffice: "",
  address: "",
  timeValue: "TEMPORARY",

  records: [
    {
      itemNo: "",
      recordsSeriesTitleAndDescription: "",
      periodCovered: "",
      remarks: "",
    },
  ],

  locationOfRecords: "",
  volumeInCubicMeter: "",
  preparedBy: "",
  preparedDate: "",
  approvedBy: "",
  approvedDate: "",
};

const defaultAnnexBData = {
  croAuthorityNumber: "",
  departmentOffice: "",
  recordsOfficer: "",
  departmentHead: "",
  accessRestriction: "",
  boxNumber: "",
  disposalAuthority: "",
  recordsSeriesTitle: "",
  recordsDescription: "",
  inclusiveDates: "",
  volume: "",
  accessionNumber: "",
  receivedBy: "",
  dateReceived: "",
  remarks: "",
};

const RequestFormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = getUser();
  const [departments, setDepartments] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [requestForm, setRequestForm] = useState(null);
  const [formData, setFormData] = useState(defaultAnnexAData);

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const buildAnnexAAutoFillData = (requestFormData) => {
    const request = requestFormData?.Request;

    const selectedDepartment = departments.find(
      (department) =>
        String(department.DepartmentID) ===
        String(request?.DepartmentID || user?.DepartmentID),
    );

    console.log("USER:", user);
    console.log("REQUEST:", request);
    return {
      date: getTodayDate(),
      contactNumber:
        request?.Department?.DepartmentContact ||
        request?.AgencyForm?.AgencyContact ||
        "",

      departmentOffice:
        request?.Department?.DepartmentName ||
        selectedDepartment?.DepartmentName ||
        "",

      address:
        request?.Department?.DepartmentAddress ||
        request?.AgencyForm?.AgencyAddress ||
        "",

      timeValue: "TEMPORARY",

      records: [
        {
          itemNo: "",
          recordsSeriesTitleAndDescription: "",
          periodCovered: "",
          remarks: "",
        },
      ],

      locationOfRecords: "",
      volumeInCubicMeter: "",

      preparedBy:
        requestFormData?.PreparedUser?.FullName ||
        request?.requester?.FullName ||
        user?.FullName ||
        "",

      preparedDate: ["SUBMITTED", "APPROVED"].includes(requestFormData?.Status)
        ? requestFormData?.updatedAt
        : "",

      approvedBy: requestFormData?.ApprovedUser?.FullName || "",

      approvedDate:
        requestFormData?.Status === "APPROVED"
          ? requestFormData?.updatedAt
          : "",
    };
  };

  const defaultAnnexBData = {
    croAuthorityNumber: "",

    departmentOffice: "",

    recordsOfficer: "",

    departmentHead: "",

    accessRestriction: "NO_RESTRICTION",

    authorizedPersonnel: [
      {
        name: "",
        position: "",
      },
      {
        name: "",
        position: "",
      },
    ],

    records: [],

    accessionNumber: "",
    receivedBy: "",
    receivedPosition: "",
    dateReceived: "",
  };

  const buildAnnexBAutoFillData = (requestFormData, annexAForm) => {
    const request = requestFormData?.Request;
    const annexAData = annexAForm?.FormData || {};
    const annexARecords = annexAData.records || [];

    return {
      croAuthorityNumber: "",

      departmentOffice: request?.Department?.DepartmentName || "",

      recordsOfficer: request?.requester?.FullName || "",

      departmentHead: annexAForm?.ApprovedUser?.FullName || "",

      accessRestriction: "NO_RESTRICTION",

      authorizedPersonnel: [
        { name: "", position: "" },
        { name: "", position: "" },
      ],

      records: annexARecords.map((record) => ({
        boxNumber: request?.StorageBox?.BoxCode || "Pending storage assignment",
        recordsSeries: record.recordsSeriesTitleAndDescription || "",
        inclusiveDates: record.periodCovered || "",
        volume: annexAData.volumeInCubicMeter || "",
        disposalAuthority: record.itemNo || "",
      })),

      accessionNumber: "To be assigned by CRO",
      receivedBy: "Pending CRO receiving",
      receivedPosition: "Pending",
      dateReceived: "Pending",
    };
  };

  const fetchRequestForm = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get(`/request-forms/${id}`);
      const data = response.data.data;

      console.log("REQUEST FORM:", data);
      console.log("REQUEST:", data.Request);
      console.log("REQUEST FORMS:", data.Request?.RequestForms);

      setRequestForm(data);

      const formCode = data.RequestFormType?.FormCode;

      if (formCode === "ANNEX_A") {
        const autoFillData = buildAnnexAAutoFillData(data);
        const savedData = data.FormData || {};

        setFormData({
          ...defaultAnnexAData,
          ...autoFillData,
          ...savedData,

          departmentOffice:
            savedData.departmentOffice || autoFillData.departmentOffice,

          preparedBy: autoFillData.preparedBy || savedData.preparedBy,
          preparedDate: autoFillData.preparedDate || savedData.preparedDate,

          approvedBy: autoFillData.approvedBy || savedData.approvedBy,

          approvedDate: autoFillData.approvedDate || savedData.approvedDate,

          records: savedData.records?.length
            ? savedData.records
            : defaultAnnexAData.records,
        });
      } else if (formCode === "ANNEX_B") {
        const annexA = data?.Request?.RequestForms?.find(
          (item) => item.RequestFormType?.FormCode === "ANNEX_A",
        );

        const autoFillData = buildAnnexBAutoFillData(data, annexA);

        setFormData({
          ...defaultAnnexBData,
          ...autoFillData,
        });
      } else {
        setFormData(data.FormData || {});
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request form");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axiosClient.get("/series", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const result = response.data.data;
        setSeriesList(result.data || result || []);
      } catch {
        setSeriesList([]);
      }
    };

    fetchSeries();
  }, []);

  useEffect(() => {
    if (loadingDepartments) return;

    const loadRequestForm = async () => {
      await fetchRequestForm();
    };

    loadRequestForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loadingDepartments]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosClient.get("/departments", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const result = response.data.data;
        setDepartments(result.data || result || []);
      } catch {
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

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

  const validateAnnexA = () => {
    const errors = [];

    if (!formData.date) errors.push("Date is required.");
    if (!formData.contactNumber) errors.push("Contact number is required.");
    if (!formData.departmentOffice)
      errors.push("Department / Office is required.");
    if (!formData.address) errors.push("Address is required.");
    if (!formData.timeValue) errors.push("Time value is required.");
    if (!formData.locationOfRecords)
      errors.push("Location of records is required.");
    if (!formData.volumeInCubicMeter)
      errors.push("Volume in cubic meter is required.");
    if (!formData.preparedBy) errors.push("Prepared by is required.");

    const validRecords = (formData.records || []).filter((record) => {
      return (
        record.itemNo ||
        record.recordsSeriesTitleAndDescription ||
        record.periodCovered ||
        record.remarks
      );
    });

    if (validRecords.length === 0) {
      errors.push("At least one records series row is required.");
    }

    validRecords.forEach((record, index) => {
      if (!record.itemNo) {
        errors.push(`Row ${index + 1}: GRDS/ARDS Item No. is required.`);
      }

      if (!record.recordsSeriesTitleAndDescription) {
        errors.push(
          `Row ${index + 1}: Records Series Title and Description is required.`,
        );
      }

      if (!record.periodCovered) {
        errors.push(`Row ${index + 1}: Period Covered is required.`);
      }
    });

    return errors;
  };

  const handleSubmitForm = async () => {
    const confirmed = window.confirm("Submit this form?");

    if (!confirmed) return;

    const formCode = requestForm?.RequestFormType?.FormCode;

    if (formCode === "ANNEX_A") {
      const validationErrors = validateAnnexA();

      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        return;
      }
    }
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

  const requestStatus = requestForm?.Request?.Status;
  const formStatus = requestForm?.Status;

  const editableRequestStatuses = ["DRAFT", "FOR_COMPLIANCE", "REJECTED"];
  const editableFormStatuses = ["DRAFT"];

  const isLocked =
    !editableRequestStatuses.includes(requestStatus) ||
    !editableFormStatuses.includes(formStatus);

  return (
    <div>
      <button onClick={() => navigate(getBackPath())} style={styles.backBtn}>
        ← Back to Request
      </button>

      <h1>{requestForm.RequestFormType?.FormName || "Request Form"}</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.summaryGrid} className="no-print">
        <SummaryCard title="Form Code" value={formCode} />
        <SummaryCard
          title="Category"
          value={requestForm.RequestFormType?.FormCategory}
        />
        <SummaryCard title="Status" value={requestForm.Status} />
        <SummaryCard title="Request ID" value={requestForm.RequestID} />
      </div>

      {formCode === "ANNEX_A" ? (
        <AnnexAEditor
          formData={formData}
          setFormData={setFormData}
          seriesList={seriesList}
          requestFormStatus={requestForm.Status}
          handleChange={handleChange}
          handleSaveDraft={handleSaveDraft}
          handleSubmitForm={handleSubmitForm}
          saving={saving}
          submitting={submitting}
          isLocked={isLocked}
        />
      ) : formCode === "ANNEX_B" ? (
        <AnnexBEditor
          formData={formData}
          handleChange={handleChange}
          handleSaveDraft={handleSaveDraft}
          handleSubmitForm={handleSubmitForm}
          saving={saving}
          submitting={submitting}
          isLocked={isLocked}
        />
      ) : (
        <GenericFormEditor requestForm={requestForm} />
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
