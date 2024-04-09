import transform from 'lodash/transform';

const createFormResetDataEvent = loadContext => () => {
  const { setFormState, props } = loadContext();
  props.setInitData({});
  setFormState(formState =>
    transform(
      formState,
      (result, field, id) => {
        const newField = field.clone();
        newField.deleteValue();
        result[id] = newField;
      },
      {}
    )
  );
};

export default createFormResetDataEvent;
