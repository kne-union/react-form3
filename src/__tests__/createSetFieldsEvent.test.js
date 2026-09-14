import createSetFieldsEvent from '../Form/event/createSetFieldsEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('createSetFieldsEvent', () => {
  test('字段未注册时写入 pending，不抛错', async () => {
    const { formContextRef, pendingStore } = createMockFormContext();
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({ data: { name: 'title', value: 'hello' }, runValidate: false });

    expect(pendingStore.getPath('title')).toBe('hello');
    expect(formContextRef.current.emitter.emit).not.toHaveBeenCalledWith('form-field:input:undefined', expect.anything());
  });

  test('debug 下写入 pending 时不再 warn', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { formContextRef, pendingStore } = createMockFormContext();
    formContextRef.current.debug = true;
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({ data: { name: 'missing', value: 1 }, runValidate: false });

    expect(pendingStore.getPath('missing')).toBe(1);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('debug 下 preserve=false 且未匹配仍 warn', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { formContextRef } = createMockFormContext();
    formContextRef.current.debug = true;
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({ data: { name: 'missing', value: 1, preserve: false }, runValidate: false });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing'));
    warn.mockRestore();
  });

  test('PRE_INIT 字段不再丢弃，写入 store 并发 input', async () => {
    const { formContextRef, formState } = createMockFormContext();
    const field = createField({ id: 'f1', name: 'title', ready: false });
    formState.set('f1', field);
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({ data: { name: 'title', value: 'late' }, runValidate: false });

    expect(formState.get('f1').value).toBe('late');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 'late' });
  });

  test('ready 字段发 form-field:input', async () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', ready: true, value: 'old' }));
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({ data: { name: 'title', value: 'new' }, runValidate: false });

    expect(pendingStore.getPath('title')).toBe('new');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 'new' });
  });

  test('falsy 值 0 / false / 空字符串都会写入 pending', async () => {
    const { formContextRef, pendingStore } = createMockFormContext();
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({
      data: [
        { name: 'count', value: 0 },
        { name: 'on', value: false },
        { name: 'text', value: '' }
      ],
      runValidate: false
    });

    expect(pendingStore.getPath('count')).toBe(0);
    expect(pendingStore.getPath('on')).toBe(false);
    expect(pendingStore.getPath('text')).toBe('');
  });

  test('分组 path 写入 pending', async () => {
    const { formContextRef, pendingStore } = createMockFormContext();
    const setFields = createSetFieldsEvent(formContextRef);

    await setFields({
      data: { name: 'title', groupName: 'users', groupIndex: 1, value: 'u1' },
      runValidate: false
    });

    expect(pendingStore.getPath('users["1"].title')).toBe('u1');
  });
});
