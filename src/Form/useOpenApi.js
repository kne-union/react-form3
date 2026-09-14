import { useMemo } from 'react';
import Field from '../core/Field';
import { collectMountedPaths } from '../core/pendingFormData';

const useOpenApi = ({ formStateRef, emitter, pendingStoreRef, mountStatusRef }) => {
  return useMemo(() => {
    const getPendingStore = () => pendingStoreRef && pendingStoreRef.current;
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
        if (mountStatusRef && mountStatusRef.current === 'mounted') {
          callback && callback();
          return;
        }
        if (mountStatusRef && mountStatusRef.current === 'destroyed') {
          return;
        }
        emitter.addListener('form:mount', () => {
          callback && callback();
        });
      },
      onDestroy(callback) {
        if (mountStatusRef && mountStatusRef.current === 'destroyed') {
          callback && callback();
          return;
        }
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
      },
      forgetField({ name, groupName, groupIndex } = {}) {
        const path = Field.getFieldValuePath({ name, groupName, groupIndex });
        const pendingStore = getPendingStore();
        pendingStore && pendingStore.forget(path);
      },
      forgetFields(list) {
        (Array.isArray(list) ? list : [list]).forEach(item => {
          const path = typeof item === 'string' ? item : Field.getFieldValuePath(item || {});
          const pendingStore = getPendingStore();
          pendingStore && pendingStore.forget(path);
        });
      },
      registerDeclaredPaths(sourceId, paths) {
        const pendingStore = getPendingStore();
        if (!pendingStore) {
          return;
        }
        pendingStore.registerDeclaredPaths(sourceId, paths);
        pendingStore.reconcile(collectMountedPaths(formStateRef.current));
      },
      unregisterDeclaredPaths(sourceId) {
        const pendingStore = getPendingStore();
        if (!pendingStore) {
          return;
        }
        pendingStore.unregisterDeclaredPaths(sourceId);
        pendingStore.reconcile(collectMountedPaths(formStateRef.current));
      }
    };
  }, [formStateRef, emitter, pendingStoreRef, mountStatusRef]);
};

export default useOpenApi;
