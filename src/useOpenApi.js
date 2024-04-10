import { useMemo } from 'react';
import Field from './core/Field';

const useOpenApi = ({ formState, emitter }) => {
  return useMemo(() => {
    return {
      emitter,
      submit: (...args) => {
        emitter.emit('form-submit', args);
      },
      get isPass() {
        return Field.stateToIsPass(formState);
      },
      get formState() {
        return formState;
      },
      get data() {
        return Field.computedFormDataFormState(formState);
      },
      set data(data) {
        emitter.emit('form-data-set', { data });
      },
      get errors() {
        return Field.stateToError(formState);
      },
      reset() {
        emitter.emit('form-data-reset');
      },
      onReady(callback) {
        emitter.addListener('form-mount', () => {
          callback && callback();
        });
      },
      onDestroy(callback) {
        emitter.addListener('form-unmount', () => {
          callback && callback();
        });
      },
      validateField({ name, groupName, groupIndex }) {
        emitter.emit('form-field-validate', { name, groupName, groupIndex });
      },
      validateAll() {
        emitter.emit('form-validate-all');
      },
      setFormData: (data, runValidate = true) => {
        emitter.emit('form-data-set', { data, runValidate });
      },
      getFormData() {
        return Field.computedFormDataFormState(formState);
      },
      setFieldValidate({ name, validate, groupName, groupIndex }) {
        if (!validate) {
          console.error('必须设置validate参数');
          return;
        }
        emitter.emit('form-data-set-field', {
          name,
          groupName,
          groupIndex,
          validate
        });
      },
      setField(list, options) {
        emitter.emit('form-data-set-field', list, options);
      },
      setFields(list, options) {
        emitter.emit('form-data-set-field', list, options);
      },
      setFieldValue({ name, groupName, groupIndex, validate }, value, options) {
        emitter.emit(
          'form-data-set-field',
          {
            name,
            groupName,
            groupIndex,
            value,
            validate
          },
          options
        );
      }
    };
  }, [formState, emitter]);
};

export default useOpenApi;
