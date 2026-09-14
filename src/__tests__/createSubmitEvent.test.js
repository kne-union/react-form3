import createSubmitEvent from '../Form/event/createSubmitEvent';
import { createField, createMockFormContext, markError, markPass } from '../test-utils/formTestUtils';

const withSubmitContext = (overrides = {}) => {
  const ctx = createMockFormContext();
  Object.assign(ctx.formContextRef.current, {
    task: { target: Promise.resolve() },
    noFilter: false,
    onError: jest.fn(),
    onPrevSubmit: undefined,
    onSubmit: jest.fn(),
    onComplete: jest.fn(),
    ...overrides
  });
  return ctx;
};

describe('createSubmitEvent', () => {
  test('校验未通过时走 onError，不调用 onSubmit', async () => {
    const { formContextRef, formState } = withSubmitContext();
    formState.set('f1', markError(createField({ id: 'f1', name: 'title', value: '' }), '必填'));
    const submit = createSubmitEvent(formContextRef);

    await submit('extra');

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:validate:f1');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:submit:error', expect.any(Array));
    expect(formContextRef.current.onError).toHaveBeenCalled();
    expect(formContextRef.current.onSubmit).not.toHaveBeenCalled();
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:submit:complete', expect.objectContaining({ isPass: false }));
  });

  test('全部通过时提交表单数据', async () => {
    const { formContextRef, formState } = withSubmitContext();
    formState.set('f1', markPass(createField({ id: 'f1', name: 'title', value: 'hello' })));
    const submit = createSubmitEvent(formContextRef);

    await submit();

    expect(formContextRef.current.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'hello' }));
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:submit:success', expect.objectContaining({ title: 'hello' }));
    expect(formContextRef.current.onComplete).toHaveBeenCalledWith(expect.objectContaining({ isPass: true }));
  });

  test('默认 filterEmpty，空字符串不进提交数据', async () => {
    const { formContextRef, formState } = withSubmitContext();
    formState.set('f1', markPass(createField({ id: 'f1', name: 'title', value: 'ok' })));
    formState.set('f2', markPass(createField({ id: 'f2', name: 'remark', value: '' })));
    const submit = createSubmitEvent(formContextRef);

    await submit();

    const payload = formContextRef.current.onSubmit.mock.calls[0][0];
    expect(payload.title).toBe('ok');
    expect(payload).not.toHaveProperty('remark');
  });

  test('noFilter 为 true 时保留空值', async () => {
    const { formContextRef, formState } = withSubmitContext({ noFilter: true });
    formState.set('f1', markPass(createField({ id: 'f1', name: 'remark', value: '' })));
    const submit = createSubmitEvent(formContextRef);

    await submit();

    expect(formContextRef.current.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ remark: '' }));
  });

  test('onPrevSubmit 返回 false 时中止提交', async () => {
    const { formContextRef, formState } = withSubmitContext({
      onPrevSubmit: jest.fn(async () => false)
    });
    formState.set('f1', markPass(createField({ id: 'f1', name: 'title', value: 'hello' })));
    const submit = createSubmitEvent(formContextRef);

    const result = await submit();

    expect(result).toBe(false);
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:prev-submit:error');
    expect(formContextRef.current.onSubmit).not.toHaveBeenCalled();
  });

  test('task 失败走 onError 与 form:error', async () => {
    const error = new Error('task failed');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { formContextRef, formState } = withSubmitContext({
      task: { target: Promise.reject(error) }
    });
    formState.set('f1', markPass(createField({ id: 'f1', name: 'title', value: 'hello' })));
    const submit = createSubmitEvent(formContextRef);

    await submit();

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:error', expect.any(Array), error);
    expect(formContextRef.current.onError).toHaveBeenCalled();
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:submit:complete', expect.objectContaining({ isPass: false }));
    consoleError.mockRestore();
  });
});
