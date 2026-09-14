import createSetFieldsEvent from '../Form/event/createSetFieldsEvent';
import createFieldChangeEvent from '../Form/event/createFieldChangeEvent';
import createForgetGroupEvent from '../Form/event/createForgetGroupEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('分组 path 赋值与删除', () => {
  test('setField 分组值写入 pending 并发 input', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', groupName: 'users', groupIndex: 0, value: 'old' }));

    await createSetFieldsEvent(formContextRef)({
      data: { name: 'title', groupName: 'users', groupIndex: 0, value: 'u0' },
      runValidate: false
    });

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 'u0' });
    expect(pendingStore.getPath('users["0"].title')).toBe('u0');
  });

  test('forget-group 后下标前移的新项不会吃到旧 pending', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.setPath('users["0"].title', 'deleted-row');
    pendingStore.setPath('users["1"].title', 'keep-row');
    formState.set('gone', createField({ id: 'gone', name: 'title', groupName: 'users', groupIndex: 0, value: 'deleted-row' }));

    createForgetGroupEvent(formContextRef)({ name: 'users', groupName: 'users', index: 0 });

    expect(pendingStore.getPath('users["0"].title')).toBe('keep-row');
    expect(pendingStore.hasPath('users["1"].title')).toBe(false);

    const shifted = createField({ id: 'next', name: 'title', groupName: 'users', groupIndex: 0, ready: false });
    formState.set('next', shifted);
    await createFieldChangeEvent(formContextRef)({
      id: 'next',
      name: 'title',
      groupName: 'users',
      groupIndex: 0,
      defaultValue: 'fresh',
      rule: '',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    expect(formState.get('next').value).toBe('keep-row');
  });

  test('删除中间项后再挂载末尾新项，不会吃到被前移的旧 pending', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.mergeFormData({
      group: [
        { name: '张三', des: '描述1' },
        { name: '李四', des: '描述2' },
        { name: '王五', des: '描述3' }
      ]
    });

    createForgetGroupEvent(formContextRef)({ name: 'group', groupName: 'group', index: 1 });

    expect(pendingStore.getPath('group["0"].name')).toBe('张三');
    expect(pendingStore.getPath('group["1"].name')).toBe('王五');
    expect(pendingStore.hasPath('group["2"].name')).toBe(false);

    const added = createField({ id: 'new', name: 'name', groupName: 'group', groupIndex: 2, ready: false });
    formState.set('new', added);
    await createFieldChangeEvent(formContextRef)({
      id: 'new',
      name: 'name',
      groupName: 'group',
      groupIndex: 2,
      defaultValue: '',
      rule: '',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    expect(formState.get('new').value).toBe('');
  });
});
