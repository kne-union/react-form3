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
    emitter.addListener('form:field:add', createFieldAddEvent(formContextRef));
    emitter.addListener('form:field:change', createFieldChangeEvent(formContextRef));
    emitter.addListener('form:field:remove', createFieldRemoveEvent(formContextRef));
    emitter.addListener('form:validate', createValidateEvent(formContextRef));
    emitter.addListener('form:reset', createResetEvent(formContextRef));
    emitter.addListener('form:set-data', createSetDataEvent(formContextRef));
    emitter.addListener('form:set-fields', createSetFieldsEvent(formContextRef));
    emitter.addListener('form:submit', createSubmitEvent(formContextRef));

    emitter.addListener('form-group:change', createGroupChangeEvent(formContextRef));
    emitter.addListener('form-group:remove', createGroupRemoveEvent(formContextRef));

    return () => {
      emitter.removeAllListeners();
    };
  }, []);
  return children;
};

export default FormEvent;
