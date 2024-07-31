import Field from '../../core/Field';
import getFieldUtils from '../../core/getFieldUtils';
import isNil from 'lodash/isNil';
import get from 'lodash/get';

const createSetFieldsEvent =
  formContextRef =>
  async ({ data, runValidate = true }) => {
    const { emitter, getFormState } = formContextRef.current;
    if (!Array.isArray(data)) {
      data = [data];
    }

    const { setFieldInfo, getField } = getFieldUtils(formContextRef);

    const validateFieldIdList = [];
    data.forEach(item => {
      const { name, groupName, groupIndex, value, validate } = Object.assign({}, item);
      const fields = Field.matchFields(getFormState(), { name, groupName, groupIndex });
      fields &&
        fields.length > 0 &&
        fields.forEach(field => {
          if (item.hasOwnProperty('value')) {
            emitter.emit(`form-field:input:${field.id}`, { value: isNil(name) ? get(value, field.name) : value });
          }
          getField(field.id, field => {
            validate ? field.setValidateStatus(validate) : validateFieldIdList.push(field.id);
            setFieldInfo(field);
          });
        });
    });
    runValidate &&
      validateFieldIdList.forEach(id => {
        emitter.emit(`form-field:validate:${id}`);
      });
  };

export default createSetFieldsEvent;
