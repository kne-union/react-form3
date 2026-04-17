import createFieldChangeEvent from '../Form/event/createFieldChangeEvent';
import Field, { FORM_FIELD_STATE_ENUM, FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';

const defaultInterceptor = {
  input: ({ value }) => value,
  output: ({ value }) => value
};

// ========================================
// 辅助函数：构建 formContextRef mock
// ========================================

const createMockFormContext = (initFormData = {}) => {
  const formState = new Map();
  const listeners = {};

  const formContextRef = {
    current: {
      initFormData,
      interceptor: defaultInterceptor,
      getFormState: () => formState,
      setFormState: updater => {
        const newState = updater(formState);
        formState.clear();
        newState.forEach((v, k) => formState.set(k, v));
      },
      emitter: {
        emit: jest.fn((event, data) => {
          if (listeners[event]) {
            listeners[event].forEach(cb => cb(data));
          }
        }),
        addListener: jest.fn((event, cb) => {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(cb);
        })
      }
    }
  };

  return { formContextRef, formState, listeners };
};

// ========================================
// createFieldChangeEvent 核心逻辑测试
// ========================================

describe('createFieldChangeEvent', () => {
  test('从 initFormData 赋值字符串', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: 'hello' });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe('hello');
  });

  test('从 initFormData 赋值数字 0（falsy 值 bug 修复验证）', async () => {
    const { formContextRef, formState } = createMockFormContext({ count: 0 });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'count', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'count',
      label: '数量',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe(0);
  });

  test('从 initFormData 赋值 false', async () => {
    const { formContextRef, formState } = createMockFormContext({ isActive: false });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'isActive', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'isActive',
      label: '激活',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe(false);
  });

  test('从 initFormData 赋值空字符串', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: '' });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe('');
  });

  test('initFormData 无对应字段时使用 defaultValue', async () => {
    const { formContextRef, formState } = createMockFormContext({});
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      defaultValue: '默认值',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe('默认值');
  });

  test('initFormData 有值时优先于 defaultValue', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: '来自data' });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      defaultValue: '默认值',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe('来自data');
  });

  test('已有值的字段不会被覆盖', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: '新值' });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    field.setValue('旧值');
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    const updatedField = formState.get('f1');
    expect(updatedField.value).toBe('旧值');
  });

  test('赋值后触发 form-field:input 事件', async () => {
    const { formContextRef, formState } = createMockFormContext({ name: 'hello' });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'name', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'name',
      label: '名称',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 'hello' });
  });

  test('值为 0 时也触发 form-field:input 事件', async () => {
    const { formContextRef, formState } = createMockFormContext({ count: 0 });
    const fieldChangeEvent = createFieldChangeEvent(formContextRef);

    const field = new Field({ id: 'f1', name: 'count', formInterceptor: defaultInterceptor });
    formState.set('f1', field);

    await fieldChangeEvent({
      id: 'f1',
      name: 'count',
      label: '数量',
      rule: 'REQ',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: ''
    });

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:input:f1', { value: 0 });
  });
});
