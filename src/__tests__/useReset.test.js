import { createElement } from 'react';
import useReset from '../useReset';
import { Provider } from '../formContext';
import { renderHook } from '../test-utils/renderHook';

describe('useReset', () => {
  test('onClick 发出 form:reset', () => {
    const emitter = { emit: jest.fn() };
    const { result, unmount } = renderHook(useReset, undefined, {
      wrapper: ({ children }) => createElement(Provider, { value: { emitter } }, children)
    });

    result.current.onClick();

    expect(emitter.emit).toHaveBeenCalledWith('form:reset');
    unmount();
  });
});
