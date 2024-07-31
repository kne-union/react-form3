import { useMemo } from 'react';
import Field from '../core/Field';

const useOpenApi = ({ formState, emitter }) => {
  return useMemo(() => {
    return {
      emitter,
      submit: (...args) => {
        emitter.emit('form:submit', args);
      },
      get isPass() {
        return Field.stateToIsPass(formState);
      },
      get formState() {
        return new Map(formState);
      },
      get data() {
        return Field.computedFormDataFormState(formState);
      },
      set data(data) {
        emitter.emit('form:set-data', { data });
      },
      get errors() {
        return Field.stateToError(formState);
      },
      reset() {
        emitter.emit('form:reset');
      },
      onReady(callback) {
        emitter.addListener('form:mount', () => {
          callback && callback();
        });
      },
      onDestroy(callback) {
        emitter.addListener('form:unmount', () => {
          callback && callback();
        });
      },
      validateField({ name, groupName, groupIndex }) {
        emitter.emit('form-field:validate', { name, groupName, groupIndex });
      },
      validateAll() {
        emitter.emit('form:validate');
      },
      setFormData: (data, runValidate = true) => {
        emitter.emit('form:set-data', { data, runValidate });
      },
      getFormData() {
        return Field.computedFormDataFormState(formState);
      },
      getField({ name, groupName, groupIndex }) {
        return Field.findField(formState, { name, groupName, groupIndex });
      },
      getFields({ name, groupName, groupIndex }) {
        return Field.matchFields(formState, { name, groupName, groupIndex });
      },
      setFieldValidate({ name, validate, groupName, groupIndex }) {
        if (!validate) {
          console.error('必须设置validate参数');
          return;
        }
        emitter.emit('form:set-fields', {
          data: {
            name,
            groupName,
            groupIndex,
            validate
          }
        });
      },
      setField(list, options) {
        emitter.emit('form:set-fields', Object.assign({}, options, { data: list }));
      },
      setFields(list, options) {
        emitter.emit('form:set-fields', Object.assign({}, options, { data: list }));
      },
      setFieldValue({ name, groupName, groupIndex, validate }, value, options) {
        emitter.emit(
          'form:set-fields',
          Object.assign({}, options, {
            data: {
              name,
              groupName,
              groupIndex,
              value,
              validate
            }
          })
        );
      }
    };
  }, [formState, emitter]);
};

export default useOpenApi;
