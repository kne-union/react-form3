import cloneDeep from 'lodash/cloneDeep';
import getIdlePromise from '../../core/getIdlePromise';
import { collectMountedPaths } from '../../core/pendingFormData';

const createSetDataEvent =
  formContextRef =>
  async ({ data, runValidate = true }) => {
    const { setFormState, emitter, setInitFormData, pendingStore, getFormState } = formContextRef.current;
    // 先更新 initFormData，后挂载的嵌套 GroupList/字段才能读到本次写入（而非陈旧 Form data 初值）
    if (typeof setInitFormData === 'function') {
      setInitFormData(cloneDeep(data || {}));
    }
    pendingStore && pendingStore.mergeFormData(data);
    setFormState(formState => {
      const newState = new Map();
      Array.from(formState.values()).forEach(field => {
        if (!field.isReady) {
          const newField = field.clone();
          const pendingValue = pendingStore && pendingStore.getValueForField(newField);
          if (pendingValue && pendingValue.found) {
            newField.setFieldValue(pendingValue.value);
            emitter.emit(`form-field:input:${field.id}`, { value: newField.value });
          }
          newState.set(field.id, newField);
          return;
        }
        const newField = field.clone();
        newField.setFieldValue(newField.getValueFromFormData(data));
        newState.set(field.id, newField);
        emitter.emit(`form-field:input:${field.id}`, { value: newField.value });
      });
      return newState;
    });
    pendingStore && pendingStore.reconcile(collectMountedPaths(getFormState()));
    await getIdlePromise();
    runValidate &&
      Array.from(formContextRef.current.formState.values()).forEach(field => {
        emitter.emit(`form-field:validate:${field.id}`);
      });
  };

export default createSetDataEvent;
