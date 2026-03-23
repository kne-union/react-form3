import { useRef, useEffect } from 'react';
import { useFormContext } from '../formContext';
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
  'form-group:remove': createGroupRemoveEvent
};

const FormEvent = ({ children }) => {
  const formContext = useFormContext();
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useEffect(() => {
    const { emitter, setFormIsMount } = formContextRef.current;
    //1. 设置表单为挂载状态
    setFormIsMount(true);
    emitter.emit('form:mount');
    return () => {
      //3. 设置表单为卸载状态
      emitter.emit('form:unmount');
    };
  }, []);
  useEffect(() => {
    const { emitter } = formContextRef.current;
    Object.entries(eventMap).forEach(([eventName, createEvent]) => {
      emitter.addListener(eventName, createEvent(formContextRef));
    });
    return () => {
      emitter.removeAllListeners();
    };
  }, []);
  return children;
};

export default FormEvent;
