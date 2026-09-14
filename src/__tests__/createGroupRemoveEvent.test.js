import createGroupRemoveEvent from '../Form/event/createGroupRemoveEvent';
import groupKey from '../core/groupKey';

describe('createGroupRemoveEvent', () => {
  test('删除已存在的分组 key', () => {
    const key = groupKey('root', 'users');
    let group = { [key]: [{ id: 'a' }], other: true };
    const formContextRef = {
      current: {
        setGroup: updater => {
          const next = updater(group);
          if (next) {
            group = next;
          }
        }
      }
    };

    createGroupRemoveEvent(formContextRef)({ parentId: 'root', name: 'users' });

    expect(group[key]).toBeUndefined();
    expect(group.other).toBe(true);
  });

  test('key 不存在时不改其它分组', () => {
    const key = groupKey('root', 'keep');
    let group = { [key]: [{ id: 'x' }] };
    const formContextRef = {
      current: {
        setGroup: updater => {
          const next = updater(group);
          if (next) {
            group = next;
          }
        }
      }
    };

    createGroupRemoveEvent(formContextRef)({ parentId: 'root', name: 'missing' });

    expect(group[key]).toEqual([{ id: 'x' }]);
  });
});
