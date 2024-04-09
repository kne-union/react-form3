import Field, { FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';

const createFieldValidateEvent =
  loadContext =>
  async ({ id, name, groupName, groupIndex }) => {
    const { formState, setFormState, task, emitter, props } = loadContext();
    const field = Field.findField(formState, { id, name, groupName, groupIndex });
    if (!field) {
      return;
    }

    const setFieldInfo = field => {
      loadContext().formState[field.id] && setFormState(formState => Object.assign({}, formState, { [field.id]: field }));
    };

    const newField = field.clone();
    newField.setValidateStatus({ status: FORM_FIELD_VALIDATE_STATE_ENUM.PENDING });
    setFieldInfo(newField);

    //处理空格情况
    let trimValue = newField.value;
    if (typeof newField.value === 'string' && newField.noTrim !== true) {
      trimValue = newField.value.trim();
      if (newField.value !== trimValue) {
        newField.setValue(trimValue);
        emitter.emit('form-field-data-change', { id, value: trimValue });
      }
    }

    //添加到校验任务队列
    await task.append(field.id, () => {
      return newField.runValidate(props.rules, () => props.formData);
    });

    setFieldInfo(newField);
    emitter.emit('form-field-validate-complete', {
      id,
      name: newField.name,
      value: trimValue,
      index: newField.groupIndex,
      validate: newField.validate
    });
  };

export default createFieldValidateEvent;
