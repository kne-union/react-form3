import Field from '../core/Field';
import { filterEmpty } from '../core/empty';

const createFormSubmitEvent = loadContext => async args => {
  const { formState, emitter, task, props } = loadContext();
  if (!Array.isArray(args)) {
    args = [args];
  }

  Object.values(formState).forEach(field => {
    emitter.emit('form-field-validate', { id: field.id });
  });

  let formData = {},
    isPass = false,
    errors = [];
  await (async () => {
    await task.target;
    const { formState: currentFormState } = loadContext();
    isPass = Field.stateToIsPass(currentFormState);

    if (!isPass) {
      errors = Field.stateToError(currentFormState);
      emitter.emit('form-submit-error', errors);
      props.onError && (await props.onError(errors, ...args));
      return false;
    }

    const targetFormData = Field.computedFormDataFormState(currentFormState);
    formData = props.noFilter === true ? targetFormData : filterEmpty(targetFormData);
    emitter.emit('form-prev-submit');
    if (props.onPrevSubmit && (await props.onPrevSubmit(formData, ...args)) === false) {
      emitter.emit('form-prev-submit-error');
      return false;
    }
    props.onSubmit && (await props.onSubmit(formData, ...args));
    emitter.emit('form-submit-success', formData);
    return true;
  })().then(
    res => {
      emitter.emit('form-submit-end', res);
    },
    e => {
      console.error(e);
      emitter.emit('form-error', e);
      props.onError && props.onError(e, ...args);
    }
  );

  emitter.emit('form-submit-complete', { formData, isPass, errors });
  props.onComplete && props.onComplete({ formData, isPass, errors });
};

export default createFormSubmitEvent;
