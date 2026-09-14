import getFieldUtils from '../../core/getFieldUtils';
import get from 'lodash/get';

const createFieldChangeEvent =
  formContextRef =>
  async ({ id, defaultValue, ...fieldProps }) => {
    const { setFormState, initFormData, getInitFormData, emitter } = formContextRef.current;
    const { getField } = getFieldUtils(formContextRef);
    getField(id, async field => {
      field.setInfo(fieldProps);
      (() => {
        if (field.value !== void 0) {
          return;
        }
        const source = typeof getInitFormData === 'function' ? getInitFormData() : initFormData;
        const groupList = field.groupName && source ? get(source, field.groupName) : null;
        const beyondList = Array.isArray(groupList) && field.groupIndex != null && field.groupIndex >= groupList.length;
        const pendingStore = formContextRef.current.pendingStore;
        const pendingValue = pendingStore && pendingStore.getValueForField(field);
        if (!beyondList && pendingValue && pendingValue.found) {
          field.setFieldValue(pendingValue.value);
          return;
        }
        const fieldInitData = field.getValueFromFormData(source);
        if (!beyondList && fieldInitData !== undefined && fieldInitData !== null) {
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
