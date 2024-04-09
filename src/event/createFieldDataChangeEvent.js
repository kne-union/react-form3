const createFieldDataChangeEvent =
  loadContext =>
  ({ id, value }) => {
    const { setFormState, formState } = loadContext();
    if (!formState[id]) {
      return;
    }
    const field = formState[id].clone();
    field.setValue(value);

    setFormState(Object.assign({}, formState, { [field.id]: field }));
  };

export default createFieldDataChangeEvent;
