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
      emitter.emit(`form-field:mount:${id}`);
      return newState;
    });
  };

export default createFieldAddEvent;
