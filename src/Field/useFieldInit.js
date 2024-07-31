import { useEffect, useRef, useState } from 'react';
import { useFormContext } from '../formContext';

const useFieldInit = ({ name, rule, label, interceptor, associations, noTrim, defaultValue, id, groupName, groupIndex, errMsg }) => {
  const [fieldIsMount, setFieldIsMount] = useState(false);
  const fieldRef = useRef(null);
  const { formIsMount, emitter } = useFormContext();
  const associationsRef = useRef(associations);
  useEffect(() => {
    let isEmit = false;
    if (formIsMount) {
      isEmit = true;
      setFieldIsMount(true);
      emitter.emit('form:field:add', { name, associations: associationsRef.current, id });
    }
    return () => {
      isEmit && emitter.emit('form:field:remove', { id });
    };
  }, [formIsMount, emitter, name, id]);

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
        defaultValue,
        fieldRef,
        errMsg
      });
    }
  }, [fieldIsMount, emitter, name, rule, label, interceptor, noTrim, id, groupName, groupIndex, defaultValue, fieldRef, errMsg]);

  return fieldRef;
};

export default useFieldInit;
