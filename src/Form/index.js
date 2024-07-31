import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Provider } from '../formContext';
import FormEvent from './FormEvent';
import FormApiProvider from './FormApiProvider';
import useFormGroup from './useFormGroup';
import useInterceptors from './useInterceptors';
import useEvent from '@kne/use-event';
import useFormTask from './useFormTask';
import useOpenApi from './useOpenApi';
import RULES from '../core/RULES';

const Form = forwardRef(({ data, rules, interceptors, debug, noFilter, onPrevSubmit, onSubmit, onError, onFormDataChange, children }, ref) => {
  const [formState, setFormState] = useState(new Map());
  const formStateRef = useRef(formState);
  const [formIsMount, setFormIsMount] = useState(false);
  const task = useFormTask();
  const emitter = useEvent({ debug, name: 'react-form3' });
  const { group, setGroup } = useFormGroup();
  const openApi = useOpenApi({ emitter, formStateRef });
  const interceptor = useInterceptors({ interceptors });
  useImperativeHandle(ref, () => openApi, [openApi]);

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
        group,
        setGroup,
        initFormData: Object.assign({}, data),
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
