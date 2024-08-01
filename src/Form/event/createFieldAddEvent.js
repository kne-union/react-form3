import Field from '../../core/Field';

const createFieldAddEvent =
  formContextRef =>
  ({ id, name, associations }) => {
    const { setFormState, interceptor, emitter } = formContextRef.current;
    setFormState(formState => {
      const newState = new Map(formState);
      newState.set(
        id,
        new Field({
          id,
          name,
          formInterceptor: interceptor,
          associations
        })
      );
      return newState;
    });
    emitter.emit(`form-field:mount:${id}`);
  };

export default createFieldAddEvent;
