import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useFormContext } from '../formContext';
import { useGroupContext } from './context';
import useRefCallback from '@kne/use-ref-callback';
import get from 'lodash/get';
import range from 'lodash/range';
import cloneDeep from 'lodash/cloneDeep';
import Group from './Group';
import uniqueId from 'lodash/uniqueId';

const GroupList = forwardRef(({ name, defaultLength = 1, empty, reverseOrder = true, children }, ref) => {
  const [list, setList] = useState([]);
  const listRef = useRef(list);
  listRef.current = list;
  const { initFormData: initData, getInitFormData, setInitFormData, emitter, pendingStore } = useFormContext();
  const { id: parentId, name: parentName, index: parentIndex } = useGroupContext();

  const resolveInitData = () => (typeof getInitFormData === 'function' ? getInitFormData() : initData);

  const groupName = useMemo(() => {
    if (parentIndex > -1 && parentName) {
      return `${parentName}[${parentIndex}]`;
    }
    return '';
  }, [parentName, parentIndex]);

  const targetPath = groupName ? `${groupName}.${name}` : name;

  const patchInitList = mutator => {
    if (typeof setInitFormData !== 'function') {
      return;
    }
    const current = cloneDeep(resolveInitData() || {});
    const nextList = get(current, targetPath);
    if (!Array.isArray(nextList)) {
      return;
    }
    mutator(nextList);
    setInitFormData(current);
  };

  const itemIdGenerator = item => Object.assign({}, item, { id: parentId ? uniqueId(parentId + '-') : uniqueId() });

  const bindEvent = useRefCallback(({ groupName, name }) => {
    const setListFromFormData = value => {
      const targetList = (() => {
        if (Array.isArray(value)) {
          return value.map((item, index) => {
            return listRef.current[index] || itemIdGenerator({ defaultValue: item });
          });
        }
        if (Number.isInteger(defaultLength) && defaultLength > 0) {
          return range(0, defaultLength).map(index => {
            return listRef.current[index] || itemIdGenerator();
          });
        }
        return [];
      })();
      setList(targetList);
    };

    setListFromFormData(get(resolveInitData(), groupName ? `${groupName}.${name}` : name));
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
    const hasDefault = !!(options && Object.prototype.hasOwnProperty.call(options, 'defaultValue'));
    const defaultValue = hasDefault ? options.defaultValue : undefined;
    setList(list => {
      const nextIndex = list.length;
      if (!hasDefault) {
        const target = get(resolveInitData(), targetPath);
        if (Array.isArray(target) && target.length > nextIndex) {
          patchInitList(nextList => {
            nextList.splice(nextIndex);
          });
        }
        pendingStore && pendingStore.forgetByPrefix(`${targetPath}["${nextIndex}"]`);
      }
      const item = hasDefault ? itemIdGenerator({ defaultValue }) : itemIdGenerator();
      if (list.length === 0) {
        return [item];
      }
      return list.concat(item);
    });
  });

  const removeHandler = useRefCallback(id => {
    setList(list => {
      const index = list.findIndex(item => item.id === id);
      if (index > -1) {
        emitter.emit('form:forget-group', { name, groupName: targetPath, index, id });
      }
      const target = get(resolveInitData(), targetPath);
      if (Array.isArray(target)) {
        patchInitList(nextList => {
          nextList.splice(index, 1);
        });
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

  const indexedList = list.map((item, index) => Object.assign({}, item, { index }));
  return (reverseOrder ? indexedList.slice(0).reverse() : indexedList).map(({ id, defaultValue, index }) => {
    return (
      <Group key={id} id={id} name={name} index={index} defaultValue={defaultValue}>
        {({ index: groupIndex }) => {
          return children({
            id,
            index: groupIndex,
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
