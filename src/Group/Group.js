import React, { useMemo } from 'react';
import { Provider, useGroupContext } from './context';
import { useFormContext } from '../formContext';
import groupKey from '../core/groupKey';
import get from 'lodash/get';

const Group = ({ id, name, children, defaultValue }) => {
  const { group } = useFormContext();
  const { id: parentId, index: parentIndex, name: parentName } = useGroupContext();

  const index = useMemo(() => {
    return get(group, groupKey(parentId, name), []).findIndex(item => item.id === id);
  }, [id, parentId, group, name]);

  const groupName = useMemo(() => {
    if (index > -1 && parentName) {
      return `${parentName}[${parentIndex}].${name}`;
    }
    return name;
  }, [parentName, name, index, parentIndex]);

  return (
    <Provider value={{ id, name: groupName, group, index, defaultValue }}>
      {children({
        id,
        name: groupName,
        group,
        index
      })}
    </Provider>
  );
};

export default Group;
