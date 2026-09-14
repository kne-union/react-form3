import { createElement } from 'react';
import useField from '../Field/useField';
import { Provider } from '../formContext';
import { Provider as GroupProvider } from '../Group/context';
import { createPendingStore } from '../core/pendingFormData';
import { renderHook } from '../test-utils/renderHook';

const mockEmitter = () => ({
  emit: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() }))
});

const createContext = (overrides = {}) => {
  const initFormData = overrides.initFormData !== undefined ? overrides.initFormData : {};
  return {
    formState: new Map(),
    initFormData,
    getInitFormData: () => initFormData,
    pendingStore: createPendingStore(),
    formIsMount: false,
    emitter: mockEmitter(),
    ...overrides,
    initFormData,
    getInitFormData: overrides.getInitFormData || (() => initFormData)
  };
};

const wrap = (ctx, group) => {
  return ({ children }) => createElement(Provider, { value: ctx }, group ? createElement(GroupProvider, { value: group }, children) : children);
};

describe('useField 首屏种值', () => {
  test('pending 优先于 Form data 与 defaultValue', () => {
    const ctx = createContext({ initFormData: { title: 'from-data' } });
    ctx.pendingStore.setPath('title', 'from-pending');
    const { result, unmount } = renderHook(useField, { name: 'title', defaultValue: 'from-default' }, { wrapper: wrap(ctx) });

    expect(result.current.value).toBe('from-pending');
    unmount();
  });

  test('无 pending 时用 Form data', () => {
    const ctx = createContext({ initFormData: { title: 'from-data' } });
    const { result, unmount } = renderHook(useField, { name: 'title', defaultValue: 'from-default' }, { wrapper: wrap(ctx) });

    expect(result.current.value).toBe('from-data');
    unmount();
  });

  test('data 为 null / undefined 时回退 defaultValue', () => {
    const ctx = createContext({ initFormData: { title: null } });
    const { result, unmount } = renderHook(useField, { name: 'title', defaultValue: 'from-default' }, { wrapper: wrap(ctx) });

    expect(result.current.value).toBe('from-default');
    unmount();
  });

  test('分组 path 从 pending 种值', () => {
    const ctx = createContext();
    ctx.pendingStore.setPath('users["0"].title', 'g0');
    const { result, unmount } = renderHook(useField, { name: 'title', defaultValue: 'from-default' }, { wrapper: wrap(ctx, { name: 'users', index: 0 }) });

    expect(result.current.value).toBe('g0');
    expect(result.current.groupName).toBe('users');
    expect(result.current.groupIndex).toBe(0);
    unmount();
  });
});
