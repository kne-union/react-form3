import transform from 'lodash/transform';
import Field from '../core/Field';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

const createFormSetDataEvent =
  loadContext =>
  ({ data, runValidate = true }) => {
    const { setFormState, props, emitter } = loadContext();
    const newInitData = cloneDeep(Object.assign({}, props.getInitData(), data));
    setFormState(formState => {
      const newState = transform(
        formState,
        (result, field, id) => {
          const newField = field.clone();
          result[id] = newField.setFieldValue(newField.getValueFromFormData(data));
          set(newInitData, Field.getFieldValuePath(newField), void 0);
        },
        {}
      );
      props.setInitData(newInitData);
      setTimeout(() => {
        runValidate &&
          Object.values(formState).forEach(field => {
            emitter.emit('form-field-validate', { id: field.id });
          });
      }, 0);
      return newState;
    });
  };

export default createFormSetDataEvent;
