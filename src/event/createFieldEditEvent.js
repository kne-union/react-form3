import Field from '../core/Field';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

const createFieldEditEvent =
  loadContext =>
  ({ id, value, ...fieldProps }) => {
    const { props, setFormState } = loadContext();
    setFormState(formState => {
      if (!formState[id]) {
        return formState;
      }
      const field = formState[id].clone();
      field.setInfo(fieldProps);

      // 给字段赋初始值
      (() => {
        if (field.value !== void 0) {
          return;
        }
        const fieldInitData = field.getValueFromFormData(props.initData);
        if (fieldInitData) {
          field.setFieldValue(fieldInitData);
          props.setInitData(set(cloneDeep(props.getInitData()), Field.getFieldValuePath(field), void 0));
          return;
        }

        if (value !== void 0) {
          field.setFieldValue(value);
        }
      })();
      return Object.assign({}, formState, { [id]: field });
    });
  };

export default createFieldEditEvent;
