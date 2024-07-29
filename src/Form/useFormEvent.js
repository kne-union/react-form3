import { useRef, useEffect } from 'react';
import Field from '../core/Field';

const useFormEvent = ({ formState, setFormState, task, emitter, noFilter, interceptors, onPrevSubmit, onSubmit, onError, onFormDataChange }) => {
  const emitterRef = useRef(emitter);
  emitterRef.current = emitter;
  const formStateRef = useRef({ formState, setFormState });
  formStateRef.current = { formState, setFormState };

  useEffect(() => {
    const emitter = emitterRef.current;
    emitter.addListener('form:field-add', ({ id, name, associations }) => {
      const { setFormState } = formStateRef.current;
      setFormState(formState => {
        const newState = new Map(formState);
        newState.set(
          id,
          new Field({
            id,
            name,
            formInterceptor: interceptor,
            associations,
            options: {
              onValueChange: field => {
                task.expire(field.id);
                emitter.emit('form-field:change', { target: field });
              }
            }
          })
        );
        return newState;
      });
    });

    emitter.addListener('form:field-change', ({ id, name, groupIndex, groupName }) => {
      const { setFormState } = formStateRef.current;
      setFormState(formState => {
        const newState = new Map(formState);
        const field = formState.get(id);
        field.setF;
        newState.set(id, new Field({ id }));
        return newState;
      });
    });

    emitter.addListener('form:field-remove', ({ name, groupIndex, groupName }) => {});

    emitter.addListener('form:submit', async () => {
      /**
       * 1. 同步所有field数据
       * 2. 计算验证结果
       * 3. 计算formData
       * 4. 调用onSubmit
       * */
      emitter.emit('form-field:input');
      await task.target();
      formStateRef.current;
    });
  }, []);
};

export default useFormEvent;
