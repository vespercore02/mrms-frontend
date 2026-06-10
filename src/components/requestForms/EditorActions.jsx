const EditorActions = ({
  saving,
  submitting,
  handleSubmitForm,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginTop: "16px",
      }}
    >
      <button type="submit">
        {saving ? "Saving..." : "Save Draft"}
      </button>

      <button
        type="button"
        onClick={handleSubmitForm}
      >
        {submitting ? "Submitting..." : "Submit Form"}
      </button>
    </div>
  );
};

export default EditorActions;