import createForgetGroupEvent from '../Form/event/createForgetGroupEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('createForgetGroupEvent', () => {
  test('只 forget 指定 index 的分组字段', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    const first = createField({ id: 'a', name: 'title', groupName: 'users', groupIndex: 0, value: 'a' });
    const second = createField({ id: 'b', name: 'title', groupName: 'users', groupIndex: 1, value: 'b' });
    formState.set('a', first);
    formState.set('b', second);
    pendingStore.setPath('users["0"].title', 'a');
    pendingStore.setPath('users["1"].title', 'b');

    createForgetGroupEvent(formContextRef)({ name: 'users', groupName: 'users', index: 0 });

    expect(pendingStore.getPath('users["0"].title')).toBe('b');
    expect(pendingStore.hasPath('users["1"].title')).toBe(false);
  });

  test('不传 index 时 forget 整组 prefix', () => {
    const { formContextRef, pendingStore } = createMockFormContext();
    pendingStore.setPath('users["0"].title', 'a');
    pendingStore.setPath('users["1"].title', 'b');
    pendingStore.setPath('keep', 'ok');

    createForgetGroupEvent(formContextRef)({ name: 'users' });

    expect(pendingStore.hasPath('users["0"].title')).toBe(false);
    expect(pendingStore.hasPath('users["1"].title')).toBe(false);
    expect(pendingStore.hasPath('keep')).toBe(true);
  });

  test('无 pendingStore 时安全返回', () => {
    const { formContextRef } = createMockFormContext();
    formContextRef.current.pendingStore = null;
    expect(() => createForgetGroupEvent(formContextRef)({ name: 'users', index: 0 })).not.toThrow();
  });
});
