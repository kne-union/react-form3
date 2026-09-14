import createSetFieldsEvent from '../Form/event/createSetFieldsEvent';
import createFieldChangeEvent from '../Form/event/createFieldChangeEvent';
import createFieldRemoveEvent from '../Form/event/createFieldRemoveEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

const changeField = async (formContextRef, { id, name, defaultValue }) => {
  const change = createFieldChangeEvent(formContextRef);
  await change({
    id,
    name,
    label: name,
    defaultValue,
    rule: '',
    interceptor: null,
    noTrim: false,
    fieldRef: null,
    errMsg: ''
  });
};

describe('字段赋值与重建生命周期', () => {
  test('仅 Form data、pending 为空时 change 仍能种上初值', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: '哈哈哈' });
    const field = createField({ id: 'f1', name: 'name', ready: false });
    formState.set('f1', field);
    await changeField(formContextRef, { id: 'f1', name: 'name', defaultValue: undefined });
    expect(formState.get('f1').value).toBe('哈哈哈');
  });

  test('setField 发生在 add 之前，change 后回填 pending', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext({ title: 'from-data' });
    const setFields = createSetFieldsEvent(formContextRef);
    await setFields({ data: { name: 'title', value: 'from-setField' }, runValidate: false });
    expect(pendingStore.getPath('title')).toBe('from-setField');

    const field = createField({ id: 'f1', name: 'title', ready: false });
    formState.set('f1', field);
    await changeField(formContextRef, { id: 'f1', name: 'title', defaultValue: 'from-default' });

    expect(formState.get('f1').value).toBe('from-setField');
  });

  test('同 path 卸载再挂载恢复 pending', async () => {
    const { formContextRef, formState } = createMockFormContext();
    formState.set('old', createField({ id: 'old', name: 'title', value: 'typed' }));

    createFieldRemoveEvent(formContextRef)({ id: 'old' });
    expect(formState.has('old')).toBe(false);

    const next = createField({ id: 'new', name: 'title', ready: false });
    formState.set('new', next);
    await changeField(formContextRef, { id: 'new', name: 'title', defaultValue: 'default' });

    expect(formState.get('new').value).toBe('typed');
  });

  test('声明消失后同 path 再挂为空（走 defaultValue）', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.setPath('extra', 'old-extra');
    pendingStore.registerDeclaredPaths('list', ['title']);
    pendingStore.reconcile(new Set());
    expect(pendingStore.hasPath('extra')).toBe(false);

    const field = createField({ id: 'f1', name: 'extra', ready: false });
    formState.set('f1', field);
    await changeField(formContextRef, { id: 'f1', name: 'extra', defaultValue: '' });

    expect(formState.get('f1').value).toBe('');
  });

  test('forgetField 后重建不回填', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.setPath('title', 'stale');
    pendingStore.forget('title');

    const field = createField({ id: 'f1', name: 'title', ready: false });
    formState.set('f1', field);
    await changeField(formContextRef, { id: 'f1', name: 'title', defaultValue: 'fresh' });

    expect(formState.get('f1').value).toBe('fresh');
  });

  test('display=false 仍在声明内时 reconcile 保留 pending', () => {
    const { pendingStore } = createMockFormContext();
    pendingStore.setPath('hiddenScore', { ai: 0.7, manual: 0.3 });
    pendingStore.registerDeclaredPaths('list', ['enableManualScore', 'hiddenScore']);
    pendingStore.reconcile(new Set());
    expect(pendingStore.getPath('hiddenScore')).toEqual({ ai: 0.7, manual: 0.3 });
  });

  test('已挂载 path 即使不在声明里也不被 reconcile 清掉', () => {
    const { pendingStore } = createMockFormContext();
    pendingStore.setPath('raw', 'live');
    pendingStore.registerDeclaredPaths('list', ['title']);
    pendingStore.reconcile(new Set(['raw']));
    expect(pendingStore.getPath('raw')).toBe('live');
  });
});
