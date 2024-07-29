const createFieldChangeEvent =
  formContextRef =>
  ({ id, defaultValue, ...fieldProps }) => {
    const { setFormState, initFormData } = formContextRef.current;
    setFormState(formState => {
      let field = formState.get(id);
      if (!field) {
        return formState;
      }
      field = field.clone();
      const newState = new Map(formState);
      field.setInfo(fieldProps);
      (() => {
        if (field.value !== void 0) {
          return;
        }
        const fieldInitData = field.getValueFromFormData(initFormData);
        if (fieldInitData) {
          field.setFieldValue(fieldInitData);
          return;
        }
        if (defaultValue !== void 0) {
          field.setFieldValue(defaultValue);
        }
      })();
      newState.set(id, field);
      return newState;
    });
  };

export default createFieldChangeEvent;
