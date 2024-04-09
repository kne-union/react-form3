const createFormValidateEvent = loadContext => () => {
  const { formState, emitter } = loadContext();
  Object.values(formState).forEach(field => {
    emitter.emit('form-field-validate', { id: field.id });
  });
};

export default createFormValidateEvent;
