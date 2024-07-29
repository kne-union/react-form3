import React, { useState, useEffect } from 'react';
import { Provider } from '../formContext';
import FormEvent from './FormEvent';
import FormApiProvider from './FormApiProvider';
import useFormGroup from './useFormGroup';
import useInterceptors from './useInterceptors';
import useEvent from '@kne/use-event';
import useFormTask from './useFormTask';
import useOpenApi from './useOpenApi';

const Form = ({ data, rules, interceptors, debug, noFilter, onPrevSubmit, onSubmit, onError, onFormDataChange, children }) => {
  const [formState, setFormState] = useState(new Map());
  const [formIsMount, setFormIsMount] = useState(false);
  const task = useFormTask();
  const emitter = useEvent({ debug, name: 'react-form3' });
  const { group, setGroup } = useFormGroup();
  const openApi = useOpenApi({ emitter, formState });
  const interceptor = useInterceptors({ interceptors });
  useEffect(() => {
    //1. 设置表单初始值
    emitter.emit('form:data-set', { data });
    //2. 设置表单为挂载状态
    setFormIsMount(true);
    emitter.emit('form:mount');
    return () => {
      //3. 设置表单为卸载状态
      emitter.emit('form:unmount');
    };
  }, [emitter]);
  return (
    <Provider
      value={{
        emitter,
        openApi,
        task,
        formState,
        setFormState,
        formIsMount,
        group,
        setGroup,
        initFormData: Object.assign({}, data),
        rules,
        interceptor,
        debug,
        noFilter,
        onPrevSubmit,
        onSubmit,
        onError,
        onFormDataChange
      }}
    >
      <FormApiProvider>
        <FormEvent>{children}</FormEvent>
      </FormApiProvider>
    </Provider>
  );
};

export default Form;
