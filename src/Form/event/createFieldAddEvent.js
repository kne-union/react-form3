import Field from '../../core/Field';

const createFieldAddEvent =
  formContextRef =>
  ({ id, name, associations }) => {
    const { setFormState, task, interceptor } = formContextRef.current;
    setFormState(formState => {
      const newState = new Map(formState);
      newState.set(
        id,
        new Field({
          id,
          name,
          formInterceptor: interceptor,
          associations,
          options: {
            onValueChange: field => {
              task.expire(field.id);
              emitter.emit('form-field:input', { target: field });
            }
          }
        })
      );
      return newState;
    });
  };

export default createFieldAddEvent;
