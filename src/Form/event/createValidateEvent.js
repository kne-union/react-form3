const createValidateEvent = formContextRef => () => {
  const { formState, emitter } = formContextRef.current;
  Array.from(formState.values()).forEach(field => {
    emitter.emit(`form-field:validate:${field.id}`);
  });
};

export default createValidateEvent;
