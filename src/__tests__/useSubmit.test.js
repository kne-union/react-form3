import { act, createElement } from 'react';
import useSubmit from '../useSubmit';
import FormApiProvider from '../Form/FormApiProvider';
import { renderHook } from '../test-utils/renderHook';

const createEmitter = () => {
  const listeners = {};
  return {
    emit: jest.fn((event, data) => {
      (listeners[event] || []).forEach(cb => cb(data));
    }),
    addListener: jest.fn((event, cb) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(cb);
      return {
        remove: () => {
          listeners[event] = listeners[event].filter(item => item !== cb);
        }
      };
    })
  };
};

const renderUseSubmit = (props, openApi) => {
  return renderHook(useSubmit, props, {
    wrapper: ({ children }) => createElement(FormApiProvider, { openApi }, children)
  });
};

describe('useSubmit', () => {
  test('onClick 等待 idle 后发出 form:submit', async () => {
    const emitter = createEmitter();
    const { result, unmount } = renderUseSubmit({}, { emitter, isPass: true });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPass).toBe(true);

    await act(async () => {
      await result.current.onClick('arg');
    });

    expect(result.current.isLoading).toBe(true);
    expect(emitter.emit).toHaveBeenCalledWith('form:submit', ['arg']);
    unmount();
  });

  test('自定义 onClick 的返回值作为 submit 参数', async () => {
    const emitter = createEmitter();
    const onClick = jest.fn(async () => ['from-handler']);
    const { result, unmount } = renderUseSubmit({ onClick }, { emitter, isPass: true });

    await act(async () => {
      await result.current.onClick('ignored');
    });

    expect(onClick).toHaveBeenCalledWith('ignored');
    expect(emitter.emit).toHaveBeenCalledWith('form:submit', ['from-handler']);
    unmount();
  });

  test('onClick 抛错时不 emit submit', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const emitter = createEmitter();
    const { result, unmount } = renderUseSubmit(
      {
        onClick: async () => {
          throw new Error('blocked');
        }
      },
      { emitter, isPass: true }
    );

    await act(async () => {
      await result.current.onClick();
    });

    expect(emitter.emit).not.toHaveBeenCalledWith('form:submit', expect.anything());
    consoleError.mockRestore();
    unmount();
  });

  test('form:submit:complete 结束 loading', async () => {
    const emitter = createEmitter();
    const { result, unmount } = renderUseSubmit({}, { emitter, isPass: true });

    await act(async () => {
      await result.current.onClick();
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      emitter.emit('form:submit:complete');
    });
    expect(result.current.isLoading).toBe(false);
    unmount();
  });
});
