import Field from '../core/Field';
import isNil from 'lodash/isNil';
import get from 'lodash/get';

const createFieldSetDataEvent = loadContext => (data, options) => {
  const { formState, setFormState, emitter } = loadContext();
  if (!Array.isArray(data)) {
    data = [data];
  }

  const { runValidate } = Object.assign({}, { runValidate: true }, options);

  const validateFieldIdList = [];

  const newFormState = Object.assign({}, formState);

  data.forEach(item => {
    const { name, groupName, groupIndex, value, validate } = Object.assign({}, item);

    const field = Field.findField(newFormState, { name, groupName, groupIndex });

    const setFieldData = (field, value) => {
      if (item.hasOwnProperty('value')) {
        newFormState[field.id] = field.clone().setFieldValue(value);
      }
      validate ? newFormState[field.id].setValidateStatus(validate) : validateFieldIdList.push(field.id);
    };

    (() => {
      if (field) {
        setFieldData(field, value);
        return true;
      }

      if (groupName && isNil(name)) {
        Field.matchFields(newFormState, { groupName, groupIndex }).forEach(field => {
          setFieldData(field, get(value, field.name));
        });
        return true;
      }

      if (groupName && isNil(groupIndex)) {
        Field.matchFields(newFormState, { groupName, name }).forEach(field => {
          setFieldData(field, value);
        });
        return true;
      }
    })();

    setFormState(newFormState);
    setTimeout(() => {
      runValidate &&
        validateFieldIdList.forEach(id => {
          emitter.emit('form-field-validate', { id });
        });
    }, 0);
  });
};

export default createFieldSetDataEvent;
