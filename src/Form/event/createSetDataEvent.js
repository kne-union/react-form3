import getIdlePromise from '../../core/getIdlePromise';

const createSetDataEvent =
  formContextRef =>
  async ({ data, runValidate = true }) => {
    const { setFormState, emitter } = formContextRef.current;
    setFormState(formState => {
      const newState = new Map();
      Array.from(formState.values()).forEach(field => {
        const newField = field.clone();
        newField.setFieldValue(newField.getValueFromFormData(data));
        newState.set(field.id, newField);
        emitter.emit(`form-field:input:${field.id}`, { value: newField.value });
      });
      return newState;
    });
    await getIdlePromise();
    runValidate &&
      Array.from(formContextRef.current.formState.values()).forEach(field => {
        emitter.emit(`form-field:validate:${field.id}`);
      });
  };

export default createSetDataEvent;
