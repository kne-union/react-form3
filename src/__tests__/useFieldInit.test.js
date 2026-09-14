import { createElement } from 'react';
import useFieldInit from '../Field/useFieldInit';
import { Provider } from '../formContext';
import { createTestEmitter } from '../test-utils/formTestUtils';
import { renderHook } from '../test-utils/renderHook';

describe('useFieldInit', () => {
  test('formIsMount 后 add / change，卸载 remove', () => {
    const emitter = createTestEmitter();
    const { unmount } = renderHook(
      useFieldInit,
      {
        name: 'title',
        id: 'f1',
        rule: 'REQ',
        label: '标题',
        interceptor: null,
        associations: { fields: [] },
        noTrim: false,
        defaultValue: 'd',
        groupName: null,
        groupIndex: 0,
        errMsg: '',
        preserve: true
      },
      { wrapper: ({ children }) => createElement(Provider, { value: { formIsMount: true, emitter } }, children) }
    );

    expect(emitter.emit).toHaveBeenCalledWith('form:field:add', expect.objectContaining({ id: 'f1', name: 'title' }));
    expect(emitter.emit).toHaveBeenCalledWith('form:field:change', expect.objectContaining({ id: 'f1', name: 'title', defaultValue: 'd', associations: expect.objectContaining({ fields: [] }) }));

    unmount();
    expect(emitter.emit).toHaveBeenCalledWith('form:field:remove', { id: 'f1' });
  });

  test('groupIndex 为 -1 时不发 change', () => {
    const emitter = createTestEmitter();
    const { unmount } = renderHook(
      useFieldInit,
      {
        name: 'title',
        id: 'f1',
        groupIndex: -1,
        defaultValue: 'd'
      },
      { wrapper: ({ children }) => createElement(Provider, { value: { formIsMount: true, emitter } }, children) }
    );

    expect(emitter.emit).toHaveBeenCalledWith('form:field:add', expect.objectContaining({ id: 'f1' }));
    expect(emitter.emit.mock.calls.some(item => item[0] === 'form:field:change')).toBe(false);
    unmount();
  });

  test('associations.fields 变化后再次发 change', () => {
    const emitter = createTestEmitter();
    const { rerender, unmount } = renderHook(
      useFieldInit,
      {
        name: 'nickname',
        id: 'f1',
        groupIndex: 0,
        associations: { fields: [{ name: 'old' }] }
      },
      { wrapper: ({ children }) => createElement(Provider, { value: { formIsMount: true, emitter } }, children) }
    );

    emitter.emit.mockClear();
    rerender({
      name: 'nickname',
      id: 'f1',
      groupIndex: 0,
      associations: { fields: [{ name: 'name' }] }
    });

    expect(emitter.emit).toHaveBeenCalledWith(
      'form:field:change',
      expect.objectContaining({
        id: 'f1',
        associations: expect.objectContaining({ fields: [{ name: 'name' }] })
      })
    );
    unmount();
  });
});
