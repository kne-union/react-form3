import { useId, useState } from 'react';
import { useGroup } from '../Group';
import { useFormContext } from '../formContext';
import useFieldInit from './useFieldInit';
import useFieldEvent from './useFieldEvent';
import get from 'lodash/get';
import Field from '../core/Field';

const useField = ({ name, rule, label, interceptor, associations, noTrim, debounce: time = 0, onChange, defaultValue, errMsg, preserve, ...args }) => {
  const id = useId();
  const { index: groupIndex, name: groupName, defaultValue: defaultGroupValue } = useGroup();
  const { formState, initFormData, getInitFormData, pendingStore } = useFormContext();
  const [associationOptions, setAssociationOptions] = useState({});
  const fieldDefaultValue = get(defaultGroupValue, name) ?? defaultValue;
  const path = Field.getFieldValuePath({ name, groupName, groupIndex });
  const seedValue = (() => {
    const source = typeof getInitFormData === 'function' ? getInitFormData() : initFormData;
    const groupList = groupName && source ? get(source, groupName) : null;
    const inRange = !Array.isArray(groupList) || groupIndex == null || groupIndex < 0 || groupIndex < groupList.length;
    if (inRange && pendingStore && pendingStore.hasPath(path)) {
      return pendingStore.getPath(path);
    }
    const fromInit = source ? get(source, path) : undefined;
    if (inRange && fromInit !== undefined && fromInit !== null) {
      return fromInit;
    }
    return fieldDefaultValue;
  })();

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
    defaultValue: fieldDefaultValue,
    id,
    groupName,
    groupIndex,
    errMsg,
    preserve
  });
  const { validate, isValueChanged, dataChange, value } = useFieldEvent({ id, time, onChange, defaultValue: seedValue });
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
