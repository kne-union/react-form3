import { useEffect, useState, useRef } from 'react';
import { useFormContext } from '../formContext';
import getIdlePromise from '../core/getIdlePromise';
import Field, { FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';
import useRefCallback from '@kne/use-ref-callback';
import getFieldValue from '../core/getFieldValue';
import getFieldUtils from '../core/getFieldUtils';
import { useDebouncedCallback } from 'use-debounce';

const useFieldEvent = ({ id, defaultValue, onChange, time }) => {
  const formContext = useFormContext();
  const { formIsMount } = formContext;
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  const [isValueChanged, setIsValueChanged] = useState(false);
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    if (!formIsMount) {
      return;
    }
    const { getField, setFieldInfo } = getFieldUtils(formContextRef);
    const { emitter } = formContextRef.current;
    const listenerTokens = [
      emitter.addListener(`form-field:input:${id}`, ({ value }) => {
        setValue(value);
        setIsValueChanged(true);
        getField(id, async field => {
          field.setValue(value);
          await setFieldInfo(field);
          emitter.emit(`form-field:associations:${id}`);
        });
      }),
      emitter.addListener(`form-field:format:${id}`, ({ format }) => {
        getField(id, field => {
          const formatValue = format(field.value);
          if (field.value !== formatValue) {
            emitter.emit(`form-field:input:${id}`, { value: formatValue });
          }
        });
      }),
      emitter.addListener(`form-field:validate:${id}`, async () => {
        const { rules, task } = formContextRef.current;

        await task.append(id, async () => {
          getField(id, async field => {
            field.setValidateStatus({ status: FORM_FIELD_VALIDATE_STATE_ENUM.PENDING });
            setFieldInfo(field);
          });
          getField(id, field => {
            //处理空格情况
            if (field.noTrim !== true) {
              typeof field.value === 'string' && emitter.emit(`form-field:format:${id}`, { format: value => value.trim() });
            }
          });

          getField(id, async field => {
            //添加到校验任务队列
            await field.runValidate(rules, () => Field.computedFormDataFormState(formContextRef.current.getFormState()));
            setFieldInfo(field);
            emitter.emit(`form-field:validate:complete:${id}`, {
              validate: field.validate
            });
          });
        });
      }),
      emitter.addListener(`form-field:associations:${id}`, async () => {
        const { getFormState, openApi } = formContextRef.current;
        getField(id, originField => {
          Field.matchAssociationFields(getFormState(), originField).forEach(field => {
            field.associations?.callback({ target: field, origin: originField, openApi });
          });
        });
      })
    ];
    return () => {
      listenerTokens.forEach(token => {
        token.remove();
      });
    };
  }, [formIsMount]);

  const dataChange = useRefCallback((...args) => {
    onChange && onChange(...args);
    const { emitter } = formContextRef.current;
    const value = getFieldValue(...args);
    emitter.emit(`form-field:input:${id}`, { value });
  });

  const checkValidate = useRefCallback(() => {
    const { emitter } = formContextRef.current;
    emitter.emit(`form-field:validate:${id}`);
  });
  const debouncedCheckValidate = useDebouncedCallback(checkValidate, time),
    cancel = debouncedCheckValidate.cancel;

  useEffect(() => {
    const { emitter } = formContextRef.current;
    const subscription = emitter.addListener('form:reset', cancel);
    return () => {
      subscription && subscription.remove();
    };
  }, [cancel]);

  const validate = time ? debouncedCheckValidate : checkValidate;

  return { isValueChanged, value, dataChange, validate };
};

export default useFieldEvent;
