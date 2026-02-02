import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useFormContext } from '../formContext';
import { useGroupContext } from './context';
import useRefCallback from '@kne/use-ref-callback';
import get from 'lodash/get';
import range from 'lodash/range';
import Group from './Group';
import uniqueId from 'lodash/uniqueId';

const GroupList = forwardRef(({ name, defaultLength = 1, empty, reverseOrder = true, children }, ref) => {
  const [list, setList] = useState([]);
  const listRef = useRef(list);
  listRef.current = list;
  const { initFormData: initData, emitter } = useFormContext();
  const { id: parentId, name: parentName, index: parentIndex } = useGroupContext();

  const groupName = useMemo(() => {
    if (parentIndex > -1 && parentName) {
      return `${parentName}[${parentIndex}]`;
    }
    return '';
  }, [parentName, parentIndex]);

  const targetPath = groupName ? `${groupName}.${name}` : name;

  const itemIdGenerator = item => Object.assign({}, item, { id: parentId ? uniqueId(parentId + '-') : uniqueId() });

  const bindEvent = useRefCallback(({ groupName, name }) => {
    const setListFromFormData = value => {
      const targetList = (() => {
        if (Number.isInteger(defaultLength) && defaultLength > 0 && !(Array.isArray(value) && value.length >= defaultLength)) {
          return range(0, defaultLength).map(index => {
            return listRef.current[index] || itemIdGenerator();
          });
        }
        if (Array.isArray(value)) {
          return value.map((item, index) => {
            return listRef.current[index] || itemIdGenerator({ defaultValue: item });
          });
        }
        return [];
      })();
      setList(targetList);
    };

    setListFromFormData(get(initData, groupName ? `${groupName}.${name}` : name));
    const sub = emitter.addListener('form:set-data', ({ data }) => {
      setListFromFormData(get(data, groupName ? `${groupName}.${name}` : name));
    });
    return () => {
      sub.remove();
    };
  });

  useEffect(() => {
    emitter.emit('form-group:change', { parentId, name, list });
  }, [list, parentId, name, emitter]);

  useEffect(() => {
    return () => {
      emitter.emit('form-group:remove', { parentId, name });
    };
  }, [parentId, name]);

  useEffect(() => {
    return bindEvent({ groupName, name });
  }, [groupName, name]);

  const addHandler = useRefCallback(options => {
    const { defaultValue } = Object.assign({}, options);
    setList(list => {
      if (list.length === 0) {
        return [{ id: uniqueId(parentId) }];
      }
      const newList = list.slice(0);
      newList.push(itemIdGenerator({ defaultValue }));
      return newList;
    });
  });

  const removeHandler = useRefCallback(id => {
    setList(list => {
      const index = list.findIndex(item => item.id === id);
      const target = get(initData, targetPath);
      if (Array.isArray(target)) {
        target.splice(index, 1);
      }
      const newList = list.slice(0);
      newList.splice(index, 1);
      return newList;
    });
  });

  useImperativeHandle(ref, () => {
    return {
      onAdd: addHandler,
      onRemove: removeHandler
    };
  });

  if (list.length === 0) {
    return empty;
  }

  return (reverseOrder ? list.slice(0).reverse() : list).map(({ id, defaultValue }) => {
    return (
      <Group key={id} id={id} name={name} defaultValue={defaultValue}>
        {({ index }) => {
          return children({
            id,
            index,
            length: list.length,
            onAdd: addHandler,
            onRemove: () => removeHandler(id)
          });
        }}
      </Group>
    );
  });
});

export default GroupList;
