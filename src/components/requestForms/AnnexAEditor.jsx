import EditorActions from "./EditorActions";

const AnnexAEditor = ({
  formData,
  handleChange,
  handleSaveDraft,
  handleSubmitForm,
  saving,
  submitting,
}) => {
  return (
    <div>
      <h2>Annex A Draft</h2>

      <form onSubmit={handleSaveDraft}>
        <label>Department / Office</label>
        <input
          name="departmentOffice"
          value={formData.departmentOffice || ""}
          onChange={handleChange}
        />

        <label>Location of Records</label>
        <input
          name="locationOfRecords"
          value={formData.locationOfRecords || ""}
          onChange={handleChange}
        />

        <label>Records Description</label>
        <textarea
          name="recordsDescription"
          value={formData.recordsDescription || ""}
          onChange={handleChange}
        />

        <label>Inclusive Dates</label>
        <input
          name="inclusiveDates"
          value={formData.inclusiveDates || ""}
          onChange={handleChange}
        />

        <label>Volume</label>
        <input
          name="volumeInCubicMeter"
          value={formData.volumeInCubicMeter || ""}
          onChange={handleChange}
        />

        <EditorActions
          saving={saving}
          submitting={submitting}
          handleSubmitForm={handleSubmitForm}
        />
      </form>
    </div>
  );
};

export default AnnexAEditor;