import Field from '../../core/Field';
import getFieldUtils from '../../core/getFieldUtils';
import { collectMountedPaths } from '../../core/pendingFormData';
import isNil from 'lodash/isNil';
import get from 'lodash/get';

const createSetFieldsEvent =
  formContextRef =>
  async ({ data, runValidate = true }) => {
    const { emitter, getFormState, pendingStore, debug } = formContextRef.current;
    if (!Array.isArray(data)) {
      data = [data];
    }

    const { setFieldInfo, getField } = getFieldUtils(formContextRef);

    const validateFieldIdList = [];
    data.forEach(item => {
      const { name, groupName, groupIndex, value, validate, preserve } = Object.assign({}, item);
      const path = Field.getFieldValuePath({ name, groupName, groupIndex });
      if (item.hasOwnProperty('value') && pendingStore && preserve !== false) {
        pendingStore.setPath(path, value);
      }
      const fields = Field.matchFields(getFormState(), { name, groupName, groupIndex });
      if (!fields || fields.length === 0) {
        const wrotePending = pendingStore && preserve !== false && item.hasOwnProperty('value');
        debug && !wrotePending && console.warn(`[react-form] setField 未匹配到字段: ${path}`);
        return;
      }
      fields.forEach(field => {
        if (item.hasOwnProperty('value')) {
          if (field.isReady) {
            emitter.emit(`form-field:input:${field.id}`, { value: isNil(name) ? get(value, field.name) : value });
          } else {
            const nextValue = isNil(name) ? get(value, field.name) : value;
            field.setValue(nextValue);
            getField(field.id, current => {
              current.setValue(nextValue);
              setFieldInfo(current);
            });
            emitter.emit(`form-field:input:${field.id}`, { value: nextValue });
          }
        }
        getField(field.id, nextField => {
          validate ? nextField.setValidateStatus(validate) : validateFieldIdList.push(nextField.id);
          setFieldInfo(nextField);
        });
      });
    });
    pendingStore && pendingStore.reconcile(collectMountedPaths(getFormState()));
    runValidate &&
      validateFieldIdList.forEach(id => {
        emitter.emit(`form-field:validate:${id}`);
      });
  };

export default createSetFieldsEvent;
