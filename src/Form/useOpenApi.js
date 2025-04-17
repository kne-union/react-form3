import { useMemo } from 'react';
import Field from '../core/Field';

const useOpenApi = ({ formStateRef, emitter }) => {
  return useMemo(() => {
    return {
      emitter,
      submit: (...args) => {
        emitter.emit('form:submit', args);
      },
      get isPass() {
        return Field.stateToIsPass(formStateRef.current);
      },
      get formState() {
        return new Map(formStateRef.current);
      },
      get data() {
        return Field.computedFormDataFormState(formStateRef.current);
      },
      set data(data) {
        emitter.emit('form:set-data', { data });
      },
      get errors() {
        return Field.stateToError(formStateRef.current);
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
        const field = Field.findField(formStateRef.current, { name, groupName, groupIndex });
        if (!field) {
          return;
        }
        emitter.emit(`form-field:validate:${field.id}`);
      },
      validateAll() {
        emitter.emit('form:validate');
      },
      setFormData: (data, runValidate = true) => {
        emitter.emit('form:set-data', { data, runValidate });
      },
      getFormData() {
        return Field.computedFormDataFormState(formStateRef.current);
      },
      getField({ name, groupName, groupIndex }) {
        return Field.findField(formStateRef.current, { name, groupName, groupIndex });
      },
      getFields({ name, groupName, groupIndex }) {
        return Field.matchFields(formStateRef.current, { name, groupName, groupIndex });
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
  }, [formStateRef, emitter]);
};

export default useOpenApi;
