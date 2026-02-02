const createResetEvent = formContextRef => () => {
  const { getFormState, emitter } = formContextRef.current;

  emitter.emit(`form:set-fields`, {
    data: Array.from(getFormState().values()).map(field => {
      const newField = field.clone();
      newField.value = void 0;
      newField.validate = {};
      return newField;
    }),
    runValidate: false
  });
};

export default createResetEvent;
