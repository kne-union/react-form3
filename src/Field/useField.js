import { useId, useState } from 'react';
import { useGroup } from '../Group';
import { useFormContext } from '../formContext';
import useFieldInit from './useFieldInit';
import useFieldEvent from './useFieldEvent';
import get from 'lodash/get';
import Field from '../core/Field';

const useField = ({ name, rule, label, interceptor, associations, noTrim, debounce: time = 0, onChange, defaultValue, errMsg, ...args }) => {
  const id = useId();
  const { index: groupIndex, name: groupName, defaultValue: defaultGroupValue } = useGroup();
  const { formState } = useFormContext();
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
    defaultValue: get(defaultGroupValue, name) || defaultValue,
    id,
    groupName,
    groupIndex,
    errMsg
  });
  const { validate, isValueChanged, dataChange, value } = useFieldEvent({ id, time, onChange });
  const field = formState.get(id),
    formData = Field.computedFormDataFormState(formState);
  const outputProps = {
    ...args,
    id,
    name,
    label,
    value,
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
    value: value,
    errState: field.getErrState(),
    errMsg: field.getErrMsg()
  });
};

export default useField;
