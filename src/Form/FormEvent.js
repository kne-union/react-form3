import { useRef, useEffect } from 'react';
import { useFormContext } from '../formContext';
import Field from '../core/Field';
import createFieldAddEvent from './event/createFieldAddEvent';
import createFieldChangeEvent from './event/createFieldChangeEvent';
import createFieldRemoveEvent from './event/createFieldRemoveEvent';
import createSubmitEvent from './event/createSubmitEvent';
import createValidateEvent from './event/createValidateEvent';
import createResetEvent from './event/createResetEvent';
import createSetDataEvent from './event/createSetDataEvent';
import createSetFieldsEvent from './event/createSetFieldsEvent';
import createGroupChangeEvent from './event/createGroupChangeEvent';
import createGroupRemoveEvent from './event/createGroupRemoveEvent';
import createForgetGroupEvent from './event/createForgetGroupEvent';

const eventMap = {
  'form:field:add': createFieldAddEvent,
  'form:field:change': createFieldChangeEvent,
  'form:field:remove': createFieldRemoveEvent,
  'form:validate': createValidateEvent,
  'form:reset': createResetEvent,
  'form:set-data': createSetDataEvent,
  'form:set-fields': createSetFieldsEvent,
  'form:submit': createSubmitEvent,
  'form-group:change': createGroupChangeEvent,
  'form-group:remove': createGroupRemoveEvent,
  'form:forget-group': createForgetGroupEvent
};

const FormEvent = ({ children }) => {
  const formContext = useFormContext();
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useEffect(() => {
    const { emitter, setFormIsMount, mountStatusRef } = formContextRef.current;
    //1. 设置表单为挂载状态
    if (mountStatusRef) {
      mountStatusRef.current = 'mounted';
    }
    setFormIsMount(true);
    emitter.emit('form:mount');
    return () => {
      //3. 设置表单为卸载状态
      const { pendingStore } = formContextRef.current;
      if (mountStatusRef) {
        mountStatusRef.current = 'destroyed';
      }
      pendingStore && pendingStore.clear();
      emitter.emit('form:unmount');
    };
  }, []);
  useEffect(() => {
    const { emitter } = formContextRef.current;
    Object.entries(eventMap).forEach(([eventName, createEvent]) => {
      emitter.addListener(eventName, createEvent(formContextRef));
    });
    let scheduled = false;
    const flushFormDataChange = () => {
      scheduled = false;
      const { onFormDataChange, getFormState } = formContextRef.current;
      if (typeof onFormDataChange !== 'function' || typeof getFormState !== 'function') {
        return;
      }
      onFormDataChange(Field.computedFormDataFormState(getFormState()));
    };
    const scheduleFormDataChange = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      queueMicrotask(flushFormDataChange);
    };
    const changeTokens = ['form:field:set-value', 'form:field:remove', 'form:reset'].map(eventName => emitter.addListener(eventName, scheduleFormDataChange));
    return () => {
      changeTokens.forEach(token => token && token.remove());
      emitter.removeAllListeners();
    };
  }, []);
  return children;
};

export default FormEvent;
