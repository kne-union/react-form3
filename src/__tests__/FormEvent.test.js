import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import FormEvent from '../Form/FormEvent';
import { Provider } from '../formContext';
import { createPendingStore } from '../core/pendingFormData';
import { createField, createTestEmitter } from '../test-utils/formTestUtils';

const renderFormEvent = context => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(createElement(Provider, { value: context }, createElement(FormEvent, null, 'child')));
  });
  return {
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
};

describe('FormEvent', () => {
  test('挂载时 setFormIsMount 并注册事件；卸载清 pending', () => {
    const pendingStore = createPendingStore();
    pendingStore.setPath('title', 'keep');
    const setFormIsMount = jest.fn();
    const emitter = createTestEmitter();
    const context = { emitter, setFormIsMount, pendingStore };

    const { unmount } = renderFormEvent(context);

    expect(setFormIsMount).toHaveBeenCalledWith(true);
    expect(emitter.emit).toHaveBeenCalledWith('form:mount');
    ['form:field:add', 'form:field:change', 'form:field:remove', 'form:validate', 'form:reset', 'form:set-data', 'form:set-fields', 'form:submit', 'form-group:change', 'form-group:remove', 'form:forget-group'].forEach(eventName => {
      expect(emitter.addListener).toHaveBeenCalledWith(eventName, expect.any(Function));
    });

    unmount();

    expect(pendingStore.hasPath('title')).toBe(false);
    expect(emitter.emit).toHaveBeenCalledWith('form:unmount');
    expect(emitter.removeAllListeners).toHaveBeenCalled();
  });

  test('字段值变化后合并触发 onFormDataChange', async () => {
    const onFormDataChange = jest.fn();
    const pendingStore = createPendingStore();
    const setFormIsMount = jest.fn();
    const emitter = createTestEmitter();
    const formState = new Map();
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'hello' }));
    const context = {
      emitter,
      setFormIsMount,
      pendingStore,
      onFormDataChange,
      getFormState: () => formState
    };

    const { unmount } = renderFormEvent(context);
    act(() => {
      emitter.emit('form:field:set-value', { path: 'title', value: 'hello' });
      emitter.emit('form:field:set-value', { path: 'title', value: 'hello' });
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(onFormDataChange).toHaveBeenCalledTimes(1);
    expect(onFormDataChange).toHaveBeenCalledWith({ title: 'hello' });
    unmount();
  });
});
