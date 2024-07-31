import groupKey from '../../core/groupKey';

const createGroupChangeEvent =
  formContextRef =>
  ({ parentId, name, list }) => {
    const { setGroup } = formContextRef.current;
    setGroup(group => {
      const newGroup = Object.assign({}, group);
      const key = groupKey(parentId, name);
      newGroup[key] = list.slice(0);
      return newGroup;
    });
  };

export default createGroupChangeEvent;
