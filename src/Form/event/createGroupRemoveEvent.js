import groupKey from '../../core/groupKey';

const createGroupRemoveEvent =
  formContextRef =>
  ({ parentId, name }) => {
    const { setGroup } = formContextRef.current;
    setGroup(group => {
      const newGroup = Object.assign({}, group);
      const key = groupKey(parentId, name);
      if (!newGroup[key]) {
        return;
      }
      delete newGroup[key];
      return newGroup;
    });
  };

export default createGroupRemoveEvent;
