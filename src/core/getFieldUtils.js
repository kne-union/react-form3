const getFieldUtils = formContextRef => {
  const getField = (id, callback) => {
    let field = formContextRef.current.getFormState().get(id);
    if (!field) {
      return;
    }
    return callback(field.clone());
  };

  const setFieldInfo = field => {
    return formContextRef.current.setFormState(formState => {
      if (!formState.get(field.id)) {
        return formState;
      }
      const newFormState = new Map(formState);
      newFormState.set(field.id, field);
      return newFormState;
    });
  };

  return { getField, setFieldInfo };
};

export default getFieldUtils;
