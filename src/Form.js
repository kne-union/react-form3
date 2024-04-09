import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Provider } from './context';
import useRefCallback from '@kne/use-ref-callback';
import useFormTask from './useFormTask';
import useEvent from '@kne/use-event';
import useFormGroup from './useFormGroup';
import useInterceptors from './useInterceptors';
import Field from './core/Field';
import FormEvent from './FormEvent';
import FormApiProvider from './FormApiProvider';
import RULES from './core/RULES';
import useOpenApi from './useOpenApi';

const Form = forwardRef((props, ref) => {
  const { children, data, debug } = props;
  const initDataRef = useRef(data);
  const [formIsMount, setFormIsMount] = useState(false);
  const [formState, setFormState] = useState({});
  const task = useFormTask();
  const emitter = useEvent({ debug, name: 'react-from' });
  const openApi = useOpenApi({ emitter, formState });
  const { group, setGroup } = useFormGroup();
  const interceptor = useInterceptors({ interceptors: props.interceptors });
  const formInitHandler = useRefCallback(() => {
    //1. 设置表单初始值
    emitter.emit('form-data-set', { data });
    //2. 设置表单为挂载状态
    setFormIsMount(true);
    emitter.emit('form-mount');
    return () => {
      //3. 设置表单为卸载状态
      emitter.emit('form-unmount');
    };
  });
  useEffect(() => {
    return formInitHandler();
  }, [formInitHandler]);

  useImperativeHandle(ref, () => openApi, [openApi]);

  return (
    <Provider
      value={{
        props: Object.assign({}, props, {
          get initData() {
            return initDataRef.current;
          },
          getInitData() {
            return initDataRef.current;
          },
          setInitData(data) {
            initDataRef.current = data;
          },
          get formData() {
            return Field.computedFormDataFormState(formState);
          },
          rules: Object.assign({}, RULES, props.rules)
        }),
        formIsMount,
        emitter,
        task,
        formState,
        setFormState,
        group,
        setGroup,
        interceptor,
        openApi
      }}
    >
      <FormApiProvider openApi={openApi}>
        <FormEvent>{children}</FormEvent>
      </FormApiProvider>
    </Provider>
  );
});

Form.defaultProps = {
  data: {},
  debug: false,
  rules: {},
  interceptors: {}
};

export default Form;
