import { useEffect, useState, useRef } from 'react';
import { useFormContext } from '../formContext';
import getIdlePromise from '../core/getIdlePromise';
import Field, { FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';

const useFieldEvent = ({ id, defaultValue }) => {
  const formContext = useFormContext();
  const { formIsMount, emitter, task } = formContext;
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  const [isValueChanged, setIsValueChanged] = useState(false);
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    if (!formIsMount) {
      return;
    }

    const getField = (id, callback) => {
      let field = formContextRef.current.formState.get(id);
      if (!field) {
        return;
      }
      return callback(field.clone());
    };

    const setFieldInfo = field => {
      formContextRef.current.setFormState(formState => {
        if (!formState.get(field.id)) {
          return formState;
        }
        const newFormState = new Map(formState);
        newFormState.set(field.id, field);
        return newFormState;
      });
    };

    const listenerTokens = [
      emitter.addListener(`form-field:input:${id}`, ({ value }) => {
        setValue(value);
        setIsValueChanged(true);
        getField(id, field => {
          field.setValue(value);
          setFieldInfo(field);
        });
      }),
      emitter.addListener(`form-field:format:${id}`, ({ format }) => {
        getField(id, field => {
          const formatValue = format(field.value);
          if (field.value !== formatValue) {
            emitter.emit(`form-field:input:${id}`, { value: trimValue });
          }
        });
      }),
      emitter.addListener(`form-field:validate:${id}`, async () => {
        const { rules } = formContextRef.current;
        await getIdlePromise();
        getField(id, async field => {
          field.setValidateStatus({ status: FORM_FIELD_VALIDATE_STATE_ENUM.PENDING });
          setFieldInfo(field);
        });
        getField(id, field => {
          //处理空格情况
          if (field.noTrim !== true) {
            emitter.emit(`form-field:format:${id}`, { format: value => field.value === 'string' && value.trim() });
          }
        });

        await getField(id, async field => {
          //添加到校验任务队列
          await task.append(field.id, () => {
            return field.runValidate(rules, () => Field.computedFormDataFormState(formContextRef.current.formState));
          });
          setFieldInfo(field);
          emitter.emit(`form-field:validate:complete:${id}`, {
            validate: field.validate
          });
        });
      }),
      emitter.addListener(`form-field:associations:${id}`, () => {})
    ];
    return () => {
      listenerTokens.forEach(token => {
        token.remove();
      });
    };
  }, [formIsMount, emitter]);
};

export default useFieldEvent;
