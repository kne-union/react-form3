import { useEffect, useRef, useState } from 'react';
import { useFormContext } from '../formContext';
import get from 'lodash/get';

const useFieldInit = ({ name, rule, label, interceptor, associations, noTrim, defaultValue, id, groupName, groupIndex, errMsg, preserve }) => {
  const [fieldIsMount, setFieldIsMount] = useState(false);
  const fieldRef = useRef(null);
  const { formIsMount, emitter } = useFormContext();
  const associationsRef = useRef(associations);
  associationsRef.current = associations;
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;
  const invokeAssociations = useRef((...args) => {
    const callback = associationsRef.current && associationsRef.current.callback;
    return callback ? callback(...args) : undefined;
  }).current;
  const associationFieldsKey = JSON.stringify(get(associations, 'fields', []));
  useEffect(() => {
    let isEmit = false;
    if (formIsMount) {
      isEmit = true;
      setFieldIsMount(true);
      emitter.emit('form:field:add', {
        name,
        associations: {
          fields: get(associationsRef.current, 'fields', []),
          callback: invokeAssociations
        },
        id
      });
    }
    return () => {
      isEmit && emitter.emit('form:field:remove', { id });
    };
  }, [formIsMount, emitter, name, id, invokeAssociations]);

  useEffect(() => {
    if (fieldIsMount && groupIndex !== -1) {
      emitter.emit('form:field:change', {
        name,
        rule,
        label,
        interceptor,
        noTrim,
        id,
        groupName,
        groupIndex,
        defaultValue: defaultValueRef.current,
        fieldRef,
        errMsg,
        preserve,
        associations: {
          fields: get(associationsRef.current, 'fields', []),
          callback: invokeAssociations
        }
      });
    }
  }, [fieldIsMount, emitter, name, rule, label, interceptor, noTrim, id, groupName, groupIndex, fieldRef, errMsg, preserve, associationFieldsKey, invokeAssociations]);

  return fieldRef;
};

export default useFieldInit;
