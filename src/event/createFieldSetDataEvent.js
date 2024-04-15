import Field from '../core/Field';
import isNil from 'lodash/isNil';
import get from 'lodash/get';

const createFieldSetDataEvent = loadContext => async (data, options) => {
  const { setFormState, emitter } = loadContext();
  if (!Array.isArray(data)) {
    data = [data];
  }

  const { runValidate } = Object.assign({}, { runValidate: true }, options);
  const validateFieldIdList = [];
  data.forEach(item => {
    const { name, groupName, groupIndex, value, validate } = Object.assign({}, item);
    const newFormState = {};
    setFormState(formState => {
      const field = Field.findField(formState, { name, groupName, groupIndex });
      const setFieldData = (field, value) => {
        const newField = field.clone();
        if (item.hasOwnProperty('value')) {
          newField.setFieldValue(value);
        }
        validate ? newField.setValidateStatus(validate) : validateFieldIdList.push(field.id);

        newFormState[newField.id] = newField;
      };

      (() => {
        if (field) {
          setFieldData(field, value);
          return true;
        }

        if (groupName && isNil(name)) {
          Field.matchFields(formState, { groupName, groupIndex }).forEach(field => {
            setFieldData(field, get(value, field.name));
          });
          return true;
        }

        if (groupName && isNil(groupIndex)) {
          Field.matchFields(formState, { groupName, name }).forEach(field => {
            setFieldData(field, value);
          });
          return true;
        }
      })();

      return Object.assign({}, formState, newFormState);
    });
  });

  runValidate &&
    validateFieldIdList.forEach(id => {
      emitter.emit('form-field-validate', { id });
    });
};

export default createFieldSetDataEvent;
