const GenericFormEditor = ({ requestForm }) => {
  return (
    <div>
      <h2>Generic Form Editor</h2>

      <p>
        Form Code:
        {requestForm?.RequestFormType?.FormCode}
      </p>

      <p>
        This form does not yet have a dedicated editor.
      </p>
    </div>
  );
};

export default GenericFormEditor;