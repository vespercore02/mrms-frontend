import EditorActions from "./EditorActions";

const AnnexBEditor = ({
  formData,
  handleChange,
  handleSaveDraft,
  handleSubmitForm,
  saving,
  submitting,
}) => {
  return (
    <div>
      <h2>Annex B Draft</h2>

      <form onSubmit={handleSaveDraft}>
        <label>Department / Office</label>
        <input
          name="departmentOffice"
          value={formData.departmentOffice || ""}
          onChange={handleChange}
        />

        <label>Records Series Title</label>
        <input
          name="recordsSeriesTitle"
          value={formData.recordsSeriesTitle || ""}
          onChange={handleChange}
        />

        <label>Records Description</label>
        <textarea
          name="recordsDescription"
          value={formData.recordsDescription || ""}
          onChange={handleChange}
        />

        <label>Accession Number</label>
        <input
          name="accessionNumber"
          value={formData.accessionNumber || ""}
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

export default AnnexBEditor;