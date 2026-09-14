import useOpenApi from '../Form/useOpenApi';
import Field from '../core/Field';
import { createPendingStore } from '../core/pendingFormData';
import { createField, defaultInterceptor, markPass } from '../test-utils/formTestUtils';
import { renderHook } from '../test-utils/renderHook';

describe('useOpenApi', () => {
  const setup = () => {
    const formState = new Map();
    const field = markPass(createField({ id: 'f1', name: 'title', value: 'hello' }));
    formState.set('f1', field);
    const formStateRef = { current: formState };
    const emitter = { emit: jest.fn(), addListener: jest.fn() };
    const pendingStoreRef = { current: createPendingStore() };
    const mountStatusRef = { current: 'pending' };
    const { result, unmount } = renderHook(useOpenApi, { formStateRef, emitter, pendingStoreRef, mountStatusRef });
    return { result, emitter, formState, pendingStoreRef, mountStatusRef, unmount };
  };

  test('getFormData / data 只汇总已挂载字段', () => {
    const { result, unmount } = setup();
    expect(result.current.getFormData()).toEqual({ title: 'hello' });
    expect(result.current.data).toEqual({ title: 'hello' });
    unmount();
  });

  test('setField / setFormData / reset / validateAll 发对应事件', () => {
    const { result, emitter, unmount } = setup();
    result.current.setField({ name: 'title', value: 'x' });
    result.current.setFormData({ title: 'y' }, false);
    result.current.reset();
    result.current.validateAll();
    result.current.submit('arg');

    expect(emitter.emit).toHaveBeenCalledWith('form:set-fields', expect.objectContaining({ data: { name: 'title', value: 'x' } }));
    expect(emitter.emit).toHaveBeenCalledWith('form:set-data', { data: { title: 'y' }, runValidate: false });
    expect(emitter.emit).toHaveBeenCalledWith('form:reset');
    expect(emitter.emit).toHaveBeenCalledWith('form:validate');
    expect(emitter.emit).toHaveBeenCalledWith('form:submit', ['arg']);
    unmount();
  });

  test('forgetField 清除 pending', () => {
    const { result, pendingStoreRef, unmount } = setup();
    pendingStoreRef.current.setPath('title', 'stale');
    result.current.forgetField({ name: 'title' });
    expect(pendingStoreRef.current.hasPath('title')).toBe(false);
    unmount();
  });

  test('validateField 按 name 找到字段后发 validate', () => {
    const { result, emitter, unmount } = setup();
    result.current.validateField({ name: 'title' });
    expect(emitter.emit).toHaveBeenCalledWith('form-field:validate:f1');
    result.current.validateField({ name: 'missing' });
    expect(emitter.emit.mock.calls.filter(item => item[0] === 'form-field:validate:f1')).toHaveLength(1);
    unmount();
  });

  test('getField 返回 Field 实例', () => {
    const { result, unmount } = setup();
    expect(result.current.getField({ name: 'title' })).toBeInstanceOf(Field);
    unmount();
  });

  test('registerDeclaredPaths 会 reconcile', () => {
    const { result, pendingStoreRef, unmount } = setup();
    pendingStoreRef.current.setPath('extra', 'gone');
    result.current.registerDeclaredPaths('list', ['title']);
    expect(pendingStoreRef.current.hasPath('extra')).toBe(false);
    unmount();
  });

  test('setFieldValue / forgetFields / getFields / errors / data setter', () => {
    const { result, emitter, formState, pendingStoreRef, unmount } = setup();
    formState.get('f1').validate = { status: 'ERROR', msg: 'bad' };

    result.current.setFieldValue({ name: 'title' }, 'z');
    result.current.forgetFields([{ name: 'title' }, 'other']);
    pendingStoreRef.current.setPath('extra', 'x');
    pendingStoreRef.current.registerDeclaredPaths('list', ['title']);
    result.current.unregisterDeclaredPaths('list');
    result.current.data = { title: 'via-setter' };

    expect(emitter.emit).toHaveBeenCalledWith('form:set-fields', expect.objectContaining({ data: expect.objectContaining({ name: 'title', value: 'z' }) }));
    expect(pendingStoreRef.current.hasPath('title')).toBe(false);
    expect(result.current.getFields({ name: 'title' })[0].id).toBe('f1');
    expect(result.current.errors[0].name).toBe('title');
    expect(result.current.isPass).toBe(false);
    expect(emitter.emit).toHaveBeenCalledWith('form:set-data', { data: { title: 'via-setter' } });

    result.current.onReady(() => {});
    result.current.onDestroy(() => {});
    expect(emitter.addListener).toHaveBeenCalledWith('form:mount', expect.any(Function));
    expect(emitter.addListener).toHaveBeenCalledWith('form:unmount', expect.any(Function));
    unmount();
  });

  test('已 mount 时 onReady 立即回调', () => {
    const { result, emitter, mountStatusRef, unmount } = setup();
    mountStatusRef.current = 'mounted';
    const callback = jest.fn();
    result.current.onReady(callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(emitter.addListener).not.toHaveBeenCalledWith('form:mount', expect.any(Function));
    unmount();
  });

  test('已销毁时 onDestroy 立即回调', () => {
    const { result, emitter, mountStatusRef, unmount } = setup();
    mountStatusRef.current = 'destroyed';
    const callback = jest.fn();
    result.current.onDestroy(callback);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(emitter.addListener).not.toHaveBeenCalledWith('form:unmount', expect.any(Function));
    unmount();
  });
});
