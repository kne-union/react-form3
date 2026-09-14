import { act, createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import GroupList from '../Group/GroupList';
import { Provider } from '../formContext';
import { Provider as GroupProvider } from '../Group/context';
import { createTestEmitter } from '../test-utils/formTestUtils';

const renderGroupList = ({ initFormData, emitter, listRef, defaultLength = 1 }) => {
  let currentInit = initFormData;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      createElement(
        Provider,
        {
          value: {
            initFormData: currentInit,
            getInitFormData: () => currentInit,
            setInitFormData: next => {
              currentInit = next;
            },
            emitter,
            group: {}
          }
        },
        createElement(
          GroupProvider,
          { value: { id: 'root' } },
          createElement(GroupList, { name: 'users', defaultLength, ref: listRef, reverseOrder: false }, ({ index }) => createElement('span', null, String(index)))
        )
      )
    );
  });
  return {
    getInitFormData: () => currentInit,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
};

describe('GroupList', () => {
  test('onRemove 发出 form:forget-group，clone 后写回 init，不 splice 原数组', () => {
    const users = [{ title: 'a' }, { title: 'b' }];
    const initFormData = { users };
    const emitter = createTestEmitter();
    const listRef = createRef();
    let latestList = [];
    emitter.addListener('form-group:change', ({ list }) => {
      latestList = list;
    });

    const { getInitFormData, unmount } = renderGroupList({ initFormData, emitter, listRef });

    expect(latestList).toHaveLength(2);
    act(() => {
      listRef.current.onRemove(latestList[0].id);
    });

    expect(emitter.emit).toHaveBeenCalledWith('form:forget-group', expect.objectContaining({ name: 'users', groupName: 'users', index: 0 }));
    expect(users).toEqual([{ title: 'a' }, { title: 'b' }]);
    expect(initFormData.users).toEqual([{ title: 'a' }, { title: 'b' }]);
    expect(getInitFormData().users).toEqual([{ title: 'b' }]);
    unmount();
  });

  test('已有更短数组时 defaultLength 不垫长', () => {
    const emitter = createTestEmitter();
    const listRef = createRef();
    let latestList = [];
    emitter.addListener('form-group:change', ({ list }) => {
      latestList = list;
    });

    const { unmount } = renderGroupList({
      initFormData: { users: [{ title: 'only' }] },
      emitter,
      listRef,
      defaultLength: 2
    });

    expect(latestList).toHaveLength(1);
    unmount();
  });

  test('空数组以数组长度为准，不再用 defaultLength 垫开', () => {
    const emitter = createTestEmitter();
    const listRef = createRef();
    let latestList = [];
    emitter.addListener('form-group:change', ({ list }) => {
      latestList = list;
    });

    const { unmount } = renderGroupList({
      initFormData: { users: [] },
      emitter,
      listRef,
      defaultLength: 2
    });

    expect(latestList).toHaveLength(0);
    unmount();
  });

  test('没有数组时才用 defaultLength', () => {
    const emitter = createTestEmitter();
    const listRef = createRef();
    let latestList = [];
    emitter.addListener('form-group:change', ({ list }) => {
      latestList = list;
    });

    const { unmount } = renderGroupList({
      initFormData: {},
      emitter,
      listRef,
      defaultLength: 2
    });

    expect(latestList).toHaveLength(2);
    unmount();
  });

  test('卸载时发出 form-group:remove', () => {
    const emitter = createTestEmitter();
    const listRef = createRef();
    const { unmount } = renderGroupList({ initFormData: { users: [{ title: 'a' }] }, emitter, listRef });

    unmount();
    expect(emitter.emit).toHaveBeenCalledWith('form-group:remove', expect.objectContaining({ parentId: 'root', name: 'users' }));
  });
});
