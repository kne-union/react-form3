import createGroupChangeEvent from '../Form/event/createGroupChangeEvent';
import groupKey from '../core/groupKey';

describe('createGroupChangeEvent', () => {
  test('按 parentId 与 name 写入 group 列表副本', () => {
    let group = {};
    const formContextRef = {
      current: {
        setGroup: updater => {
          group = updater(group);
        }
      }
    };
    const list = [{ id: 'a' }, { id: 'b' }];
    createGroupChangeEvent(formContextRef)({ parentId: 'root', name: 'users', list });

    const key = groupKey('root', 'users');
    expect(group[key]).toEqual(list);
    expect(group[key]).not.toBe(list);
  });
});
