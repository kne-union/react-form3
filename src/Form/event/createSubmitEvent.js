import Field from '../../core/Field';
import { filterEmpty } from '../../core/empty';

const createSubmitEvent =
  formContextRef =>
  async (...args) => {
    const { task, emitter, noFilter, onError, onPrevSubmit, onSubmit, onComplete } = formContextRef.current;
    formContextRef.current.getFormState().forEach(value => {
      emitter.emit(`form-field:validate:${value.id}`);
    });
    let errors = [],
      isPass = false,
      formData = {};
    try {
      await task.target;
      isPass = Field.stateToIsPass(formContextRef.current.getFormState());
      if (!isPass) {
        errors = Field.stateToError(formContextRef.current.getFormState());
        emitter.emit('form:submit:error', errors);
        onError && (await onError(errors, ...args));
      } else {
        const targetFormData = Field.computedFormDataFormState(formContextRef.current.getFormState());
        formData = noFilter === true ? targetFormData : filterEmpty(targetFormData);

        emitter.emit('form:prev-submit', formData, ...args);
        if (onPrevSubmit && (await onPrevSubmit(formData, ...args)) === false) {
          emitter.emit('form:prev-submit:error');
          return false;
        }
        onSubmit && (await onSubmit(formData, ...args));
        emitter.emit('form:submit:success', formData, ...args);
      }
    } catch (e) {
      console.error(e);
      emitter.emit('form:error', errors, ...args, e);
      onError && onError(errors, ...args, e);
    }
    emitter.emit('form:submit:complete', { formData, isPass, errors });
    onComplete && onComplete({ formData, isPass, errors });
  };

export default createSubmitEvent;
