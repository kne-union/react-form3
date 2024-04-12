const createFieldDataChangeEvent =
  loadContext =>
  ({ id, value }) => {
    const { setFormState, formState, task } = loadContext();
    if (!formState[id]) {
      return;
    }
    const field = formState[id].clone();
    field.setValue(value);
    setFormState(formState => Object.assign({}, formState, { [field.id]: field }));
  };

export default createFieldDataChangeEvent;
