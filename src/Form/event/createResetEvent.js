const createResetEvent = formContextRef => () => {
  const { getFormState, emitter } = formContextRef.current;
  Array.from(getFormState().values()).forEach(field => {
    emitter.emit(`form-field:input:${field.id}`, { value: void 0 });
  });
};

export default createResetEvent;
