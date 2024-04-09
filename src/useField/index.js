import { useId, useState } from 'react';
import { useGroup } from '../Group';
import { useFormContext } from '../context';
import useFieldInit from './useFieldInit';
import useValidate from './useValidate';
import useFieldDataChange from './useFieldDataChange';
import get from 'lodash/get';

const useField = ({ name, rule, label, interceptor, associations, noTrim, debounce: time = 0, onChange, value, errMsg, ...args }) => {
  const id = useId();
  const { index: groupIndex, name: groupName } = useGroup();
  const { formState, formData } = useFormContext();
  const [associationOptions, setAssociationOptions] = useState({});

  const fieldRef = useFieldInit({
    name,
    rule,
    label,
    interceptor,
    associations: {
      fields: get(associations, 'fields', []),
      callback: (...args) => {
        setAssociationOptions(Object.assign({}, associations?.callback(...args)));
      }
    },
    noTrim,
    value,
    id,
    groupName,
    groupIndex,
    errMsg
  });
  const validate = useValidate({ id, time });
  const { isValueChanged, onChange: dataChange } = useFieldDataChange({ id, onChange });
  const field = formState[id];
  const outputProps = {
    ...args,
    id,
    name,
    label,
    fieldRef,
    formData,
    formState,
    rule,
    groupName,
    groupIndex,
    onChange: dataChange,
    isValueChanged,
    triggerValidate: validate,
    associationOptions
  };

  if (!field) {
    return outputProps;
  }

  return Object.assign({}, outputProps, {
    value: field.value,
    errState: field.getErrState(),
    errMsg: field.getErrMsg()
  });
};

export default useField;
