import getFieldUtils from '../../core/getFieldUtils';

const createFieldChangeEvent =
  formContextRef =>
  async ({ id, defaultValue, ...fieldProps }) => {
    const { setFormState, initFormData, emitter } = formContextRef.current;
    const { getField } = getFieldUtils(formContextRef);
    getField(id, async field => {
      field.setInfo(fieldProps);
      (() => {
        if (field.value !== void 0) {
          return;
        }
        const fieldInitData = field.getValueFromFormData(initFormData);
        if (fieldInitData) {
          field.setFieldValue(fieldInitData);
          return;
        }
        if (defaultValue !== void 0) {
          field.setFieldValue(defaultValue);
        }
      })();
      setFormState(formState => {
        const newState = new Map(formState);
        newState.set(id, field);
        return newState;
      });

      if (field.value !== void 0) {
        emitter.emit(`form-field:input:${field.id}`, { value: field.value });
      }
      emitter.emit(`form:field:ready`, field);
    });
  };

export default createFieldChangeEvent;
