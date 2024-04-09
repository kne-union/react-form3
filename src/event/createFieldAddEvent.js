import Field from '../core/Field';

const createFieldAddEvent = loadContext => options => {
  const { setFormState, interceptor, emitter } = loadContext();
  const { id, name, associations } = options;
  const field = new Field({
    id,
    name,
    formInterceptor: interceptor,
    associations,
    options: {
      onValueChange: field => {
        emitter.emit('form-field-value-change', { target: field });
      }
    }
  });
  setFormState(formState =>
    Object.assign({}, formState, {
      [id]: field
    })
  );
};

export default createFieldAddEvent;
