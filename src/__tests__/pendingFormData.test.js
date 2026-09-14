import { collectMountedPaths, createPendingStore } from '../core/pendingFormData';
import Field from '../core/Field';

const interceptor = {
  input: ({ value }) => value,
  output: ({ value }) => value
};

describe('pendingFormData', () => {
  test('setField 路径在未挂载时保留，forget 后不再命中', () => {
    const store = createPendingStore();
    store.setPath('title', 'hello');
    expect(store.hasPath('title')).toBe(true);
    expect(store.getPath('title')).toBe('hello');
    store.forget('title');
    expect(store.hasPath('title')).toBe(false);
    store.setPath('title', 'again');
    expect(store.getPath('title')).toBe('again');
  });

  test('声明消失且未挂载则 reconcile 清除', () => {
    const store = createPendingStore();
    store.setPath('title', 'keep');
    store.setPath('extra', 'drop');
    store.registerDeclaredPaths('list-1', ['title']);
    store.reconcile(new Set());
    expect(store.hasPath('title')).toBe(true);
    expect(store.hasPath('extra')).toBe(false);
  });

  test('没有声明源时不 reconcile，避免裸 useField 被误清', () => {
    const store = createPendingStore();
    store.setPath('title', 'keep');
    store.reconcile(new Set());
    expect(store.hasPath('title')).toBe(true);
  });

  test('getValueForField 读 pending，forget 后找不到', () => {
    const store = createPendingStore();
    store.setPath('name', 'from-pending');
    const field = new Field({ id: 'f1', name: 'name', formInterceptor: interceptor });
    field.setInfo({ groupName: null, groupIndex: null });
    expect(store.getValueForField(field)).toEqual({ found: true, value: 'from-pending' });
    store.forget('name');
    expect(store.getValueForField(field).found).toBe(false);
  });

  test('collectMountedPaths 收集 field.path', () => {
    const formState = new Map();
    const field = new Field({ id: 'f1', name: 'title', formInterceptor: interceptor });
    field.setInfo({ groupName: null, groupIndex: null });
    formState.set('f1', field);
    expect(collectMountedPaths(formState).has('title')).toBe(true);
  });

  test('shiftAfterGroupRemove 删除中间项后末尾 pending 前移', () => {
    const store = createPendingStore();
    store.mergeFormData({
      group: [{ name: '张三' }, { name: '李四' }, { name: '王五' }]
    });
    store.shiftAfterGroupRemove('group', 1);
    expect(store.getPath('group["0"].name')).toBe('张三');
    expect(store.getPath('group["1"].name')).toBe('王五');
    expect(store.hasPath('group["2"].name')).toBe(false);
    const field = new Field({ id: 'f1', name: 'name', formInterceptor: interceptor });
    field.setInfo({ groupName: 'group', groupIndex: 2 });
    expect(store.getValueForField(field).found).toBe(false);
  });

  test('forgetByPrefix 清掉分组一项', () => {
    const store = createPendingStore();
    store.setPath('users["0"].title', 'a');
    store.setPath('users["1"].title', 'b');
    store.forgetByPrefix('users["0"]');
    expect(store.hasPath('users["0"].title')).toBe(false);
    expect(store.hasPath('users["1"].title')).toBe(true);
  });

  test('保留 0 / false / 空字符串', () => {
    const store = createPendingStore();
    store.setPath('count', 0);
    store.setPath('on', false);
    store.setPath('text', '');
    expect(store.getPath('count')).toBe(0);
    expect(store.getPath('on')).toBe(false);
    expect(store.getPath('text')).toBe('');
  });

  test('mergeFormData 后字段能读到嵌套值', () => {
    const store = createPendingStore();
    store.mergeFormData({ score: { ai: 0.6, manual: 0.4 } });
    const field = new Field({ id: 'f1', name: 'score', formInterceptor: interceptor });
    field.setInfo({ groupName: null, groupIndex: null });
    expect(store.getValueForField(field)).toEqual({ found: true, value: { ai: 0.6, manual: 0.4 } });
  });

  test('mergeFormData 收集数组项 path', () => {
    const store = createPendingStore();
    store.mergeFormData({ users: [{ title: 'a' }, { title: 'b' }] });
    const field = new Field({ id: 'f1', name: 'title', formInterceptor: interceptor });
    field.setInfo({ groupName: 'users', groupIndex: 0 });
    expect(store.getValueForField(field)).toEqual({ found: true, value: 'a' });
  });

  test('mergeFormData 非对象、空 path 操作为空操作', () => {
    const store = createPendingStore();
    store.mergeFormData(null);
    store.setPath('', 'x');
    store.forget('');
    store.forgetByPrefix('');
    expect(store.getData()).toEqual({});
  });

  test('getValueForField 无数据时 found=false', () => {
    const store = createPendingStore();
    const field = new Field({ id: 'f1', name: 'title', formInterceptor: interceptor });
    field.setInfo({ groupName: null, groupIndex: null });
    expect(store.getValueForField(field)).toEqual({ found: false });
  });

  test('unregisterDeclaredPaths 后无声明源则不再 reconcile', () => {
    const store = createPendingStore();
    store.setPath('extra', 'keep');
    store.registerDeclaredPaths('list', ['title']);
    expect(store.hasDeclaredSources()).toBe(true);
    store.unregisterDeclaredPaths('list');
    expect(store.hasDeclaredSources()).toBe(false);
    store.reconcile(new Set());
    expect(store.hasPath('extra')).toBe(true);
  });

  test('collectMountedPaths 无 path 时回退 getFieldValuePath', () => {
    const formState = new Map();
    const field = new Field({ id: 'f1', name: 'title', formInterceptor: interceptor });
    formState.set('f1', field);
    expect(collectMountedPaths(formState).has('title')).toBe(true);
    expect(collectMountedPaths(null).size).toBe(0);
  });

  test('clear 清空 pending 与 forgotten', () => {
    const store = createPendingStore();
    store.setPath('title', 'x');
    store.forget('extra');
    store.clear();
    expect(store.hasPath('title')).toBe(false);
    expect(store.isForgotten('extra')).toBe(false);
  });
});
