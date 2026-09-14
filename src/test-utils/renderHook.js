import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

export const renderHook = (useHook, props, options = {}) => {
  const { wrapper: Wrapper } = options;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const result = { current: undefined };

  const HookProbe = hookProps => {
    result.current = useHook(hookProps);
    return null;
  };

  const render = nextProps => {
    const probe = createElement(HookProbe, nextProps);
    act(() => {
      root.render(Wrapper ? createElement(Wrapper, null, probe) : probe);
    });
  };

  render(props);

  return {
    result,
    rerender: render,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  };
};
