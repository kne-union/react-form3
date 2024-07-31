const createFieldRemoveEvent =
  formContextRef =>
  ({ id }) => {
    const { setFormState } = formContextRef.current;
    setFormState(formState => {
      const newFormState = new Map(formState);
      newFormState.delete(id);
      return newFormState;
    });
  };

export default createFieldRemoveEvent;
