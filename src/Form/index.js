import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { Provider } from '../formContext';
import FormEvent from './FormEvent';
import FormApiProvider from './FormApiProvider';
import useFormGroup from './useFormGroup';
import useInterceptors from './useInterceptors';
import useEvent from '@kne/use-event';
import useFormTask from './useFormTask';
import useOpenApi from './useOpenApi';
import RULES from '../core/RULES';
import { createPendingStore } from '../core/pendingFormData';

const Form = forwardRef(({ data, rules, interceptors, debug, noFilter, onPrevSubmit, onSubmit, onError, onFormDataChange, children }, ref) => {
  const [formState, setFormState] = useState(new Map());
  const formStateRef = useRef(formState);
  const pendingStoreRef = useRef(null);
  if (!pendingStoreRef.current) {
    pendingStoreRef.current = createPendingStore();
  }
  const [formIsMount, setFormIsMount] = useState(false);
  const mountStatusRef = useRef('pending');
  const task = useFormTask();
  const emitter = useEvent({ debug, name: 'react-form3' });
  const { group, setGroup } = useFormGroup();
  const openApi = useOpenApi({ emitter, formStateRef, pendingStoreRef, mountStatusRef });
  const interceptor = useInterceptors({ interceptors });
  useImperativeHandle(ref, () => openApi, [openApi]);

  // setFormData 会同步写入；props.data 按内容对齐（仅引用变化不重置 init）。
  const propsDataRef = useRef(data);
  const initFormDataRef = useRef(cloneDeep(data || {}));
  if (!isEqual(data || {}, propsDataRef.current || {})) {
    propsDataRef.current = data;
    initFormDataRef.current = cloneDeep(data || {});
  }

  return (
    <Provider
      value={{
        emitter,
        openApi,
        task,
        formState,
        getFormState() {
          return formStateRef.current;
        },
        setFormState(input) {
          const newFormState = typeof input === 'function' ? input(formStateRef.current) : input;
          formStateRef.current = newFormState;
          setFormState(newFormState);
          return newFormState;
        },
        formIsMount,
        setFormIsMount,
        mountStatusRef,
        group,
        setGroup,
        initFormData: initFormDataRef.current,
        pendingStore: pendingStoreRef.current,
        getInitFormData: () => initFormDataRef.current,
        setInitFormData: next => {
          initFormDataRef.current = next && typeof next === 'object' ? next : {};
        },
        resetInitFormData: () => {
          initFormDataRef.current = cloneDeep(propsDataRef.current || {});
        },
        rules: Object.assign({}, RULES, rules),
        interceptor,
        debug,
        noFilter,
        onPrevSubmit,
        onSubmit,
        onError,
        onFormDataChange
      }}
    >
      <FormApiProvider openApi={openApi}>
        <FormEvent>{children}</FormEvent>
      </FormApiProvider>
    </Provider>
  );
});

export default Form;
