import { act, createElement } from 'react';
import useFieldEvent from '../Field/useFieldEvent';
import { Provider } from '../formContext';
import Field from '../core/Field';
import RULES from '../core/RULES';
import { createField, createMockFormContext, defaultInterceptor } from '../test-utils/formTestUtils';
import { renderHook } from '../test-utils/renderHook';

const setup = ({ id = 'f1', name = 'title', value = 'hello', extraFields = [] } = {}) => {
  const { formContextRef, formState } = createMockFormContext();
  const field = createField({ id, name, value });
  formState.set(id, field);
  extraFields.forEach(item => formState.set(item.id, item));
  Object.assign(formContextRef.current, {
    formIsMount: true,
    rules: RULES,
    task: { append: (taskId, runner) => runner() },
    openApi: { tag: 'api' }
  });
  const { result, unmount } = renderHook(
    useFieldEvent,
    { id, defaultValue: value },
    {
      wrapper: ({ children }) => createElement(Provider, { value: formContextRef.current }, children)
    }
  );
  return { result, unmount, formContextRef, formState, field };
};

describe('useFieldEvent', () => {
  test('dataChange 取出值并发 input', () => {
    const onChange = jest.fn();
    const { formContextRef, formState } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'hello' }));
    Object.assign(formContextRef.current, {
      formIsMount: true,
      rules: RULES,
      task: { append: (id, runner) => runner() },
      openApi: {}
    });
    const { result, unmount } = renderHook(useFieldEvent, { id: 'f1', defaultValue: 'hello', onChange }, { wrapper: ({ children }) => createElement(Provider, { value: formContextRef.current }, children) });

    act(() => {
      result.current.dataChange('typed');
    });

    expect(onChange).toHaveBeenCalledWith('typed');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 'typed' });
    expect(result.current.value).toBe('typed');
    expect(result.current.isValueChanged).toBe(true);
    unmount();
  });

  test('input 写回 store 并触发 associations', () => {
    const { formContextRef, formState, unmount } = setup();

    act(() => {
      formContextRef.current.emitter.emit('form-field:input:f1', { value: 'next' });
    });

    expect(formState.get('f1').value).toBe('next');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:field:set-value', expect.objectContaining({ id: 'f1', value: 'next', path: 'title' }));
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:associations:f1');
    unmount();
  });

  test('validate 默认 trim 后再跑规则', async () => {
    const { formContextRef, formState, result, unmount } = setup({ value: '  hi  ' });

    await act(async () => {
      result.current.validate();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(formState.get('f1').value).toBe('hi');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:validate:complete:f1', expect.objectContaining({ validate: expect.any(Object) }));
    unmount();
  });

  test('noTrim 时不发 format', async () => {
    const { formContextRef, formState } = createMockFormContext();
    const field = createField({ id: 'f1', name: 'title', value: '  hi  ' });
    field.noTrim = true;
    formState.set('f1', field);
    Object.assign(formContextRef.current, {
      formIsMount: true,
      rules: RULES,
      task: { append: (id, runner) => runner() },
      openApi: {}
    });
    const { result, unmount } = renderHook(useFieldEvent, { id: 'f1', defaultValue: '  hi  ' }, { wrapper: ({ children }) => createElement(Provider, { value: formContextRef.current }, children) });

    await act(async () => {
      result.current.validate();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(formState.get('f1').value).toBe('  hi  ');
    expect(formContextRef.current.emitter.emit).not.toHaveBeenCalledWith('form-field:format:f1', expect.anything());
    unmount();
  });

  test('associations 命中后调用目标 callback', () => {
    const callback = jest.fn();
    const target = new Field({
      id: 'district',
      name: 'district',
      formInterceptor: defaultInterceptor,
      associations: { fields: [{ name: 'title' }], callback }
    });
    target.setInfo({ groupName: null, groupIndex: null, label: 'district' });
    const { formContextRef, unmount } = setup({ extraFields: [target] });

    act(() => {
      formContextRef.current.emitter.emit('form-field:associations:f1');
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        target,
        openApi: { tag: 'api' }
      })
    );
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:associations:callback', expect.objectContaining({ origin: expect.objectContaining({ id: 'f1' }) }));
    unmount();
  });

  test('formIsMount 为 false 时不注册字段事件', () => {
    const { formContextRef, formState } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'hello' }));
    formContextRef.current.formIsMount = false;
    const { result, unmount } = renderHook(useFieldEvent, { id: 'f1', defaultValue: 'hello' }, { wrapper: ({ children }) => createElement(Provider, { value: formContextRef.current }, children) });

    act(() => {
      formContextRef.current.emitter.emit('form-field:input:f1', { value: 'ignored' });
    });

    expect(result.current.value).toBe('hello');
    unmount();
  });
});
