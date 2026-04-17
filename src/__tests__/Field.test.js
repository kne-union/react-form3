import Field, { FORM_FIELD_STATE_ENUM, FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';

const defaultInterceptor = {
  input: ({ value }) => value,
  output: ({ value }) => value
};

const createField = (overrides = {}) => {
  return new Field({
    id: 'field-1',
    name: 'username',
    formInterceptor: defaultInterceptor,
    ...overrides
  });
};

const createReadyField = (overrides = {}) => {
  const field = createField(overrides);
  field.setInfo({
    groupName: null,
    groupIndex: null,
    label: '用户名',
    rule: 'REQ',
    interceptor: null,
    noTrim: false,
    fieldRef: null,
    errMsg: ''
  });
  return field;
};

// ========================================
// 构造函数
// ========================================

describe('Field 构造函数', () => {
  test('正确初始化默认属性', () => {
    const field = createField();
    expect(field.id).toBe('field-1');
    expect(field.name).toBe('username');
    expect(field.groupName).toBeNull();
    expect(field.groupIndex).toBeNull();
    expect(field.state).toBe(FORM_FIELD_STATE_ENUM.PRE_INIT);
    expect(field.fieldRef).toBeNull();
    expect(field.value).toBeUndefined();
    expect(field.validate.status).toBe(FORM_FIELD_VALIDATE_STATE_ENUM.INIT);
  });

  test('正确初始化 associations', () => {
    const field = createField({
      associations: {
        fields: [{ name: 'city' }, { invalid: 'no-name' }],
        callback: () => 'cb'
      }
    });
    expect(field.associations.fields).toEqual([{ name: 'city' }]);
    expect(field.associations.callback()).toBe('cb');
  });

  test('associations 为空时使用默认值', () => {
    const field = createField();
    expect(field.associations.fields).toEqual([]);
    expect(typeof field.associations.callback).toBe('function');
  });
});

// ========================================
// isReady / isPass
// ========================================

describe('Field isReady / isPass', () => {
  test('PRE_INIT 状态 isReady 为 false', () => {
    const field = createField();
    expect(field.isReady).toBe(false);
  });

  test('INIT 状态 isReady 为 true', () => {
    const field = createReadyField();
    expect(field.isReady).toBe(true);
  });

  test('INIT 验证状态 isPass 为 false', () => {
    const field = createReadyField();
    expect(field.isPass).toBe(false);
  });

  test('PASS 验证状态 isPass 为 true', () => {
    const field = createReadyField();
    field.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
    expect(field.isPass).toBe(true);
  });
});

// ========================================
// setValue / setFieldValue / deleteValue
// ========================================

describe('Field 值操作', () => {
  test('setValue 正确设置值', () => {
    const field = createReadyField();
    field.setValue('hello');
    expect(field.value).toBe('hello');
  });

  test('setValue 相同值不更新', () => {
    const field = createReadyField();
    field.setValue('hello');
    const prevValidate = field.validate;
    field.setValue('hello');
    expect(field.validate).toBe(prevValidate);
  });

  test('setValue 重置验证状态为 INIT', () => {
    const field = createReadyField();
    field.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
    field.setValue('new');
    expect(field.validate.status).toBe(FORM_FIELD_VALIDATE_STATE_ENUM.INIT);
  });

  test('setFieldValue 经过 interceptor 处理', () => {
    const trimInterceptor = {
      input: ({ value, interceptor }) => {
        if (typeof value === 'string') return value.trim();
        return value;
      },
      output: ({ value }) => value
    };
    const field = createField({ formInterceptor: trimInterceptor });
    field.setInfo({ label: 'test', rule: null, interceptor: null, noTrim: false, fieldRef: null, errMsg: '' });
    field.setFieldValue('  hello  ');
    expect(field.value).toBe('hello');
  });

  test('deleteValue 将值设为 undefined', () => {
    const field = createReadyField();
    field.setValue('hello');
    field.deleteValue();
    expect(field.value).toBeUndefined();
  });
});

// ========================================
// falsy 值赋值 (0, false, '')
// ========================================

describe('Field falsy 值赋值', () => {
  test('setValue 能设置数字 0', () => {
    const field = createReadyField();
    field.setValue(0);
    expect(field.value).toBe(0);
  });

  test('setValue 能设置 false', () => {
    const field = createReadyField();
    field.setValue(false);
    expect(field.value).toBe(false);
  });

  test('setValue 能设置空字符串', () => {
    const field = createReadyField();
    field.setValue('');
    expect(field.value).toBe('');
  });

  test('0 和 undefined 不会被误判为相同值', () => {
    const field = createReadyField();
    field.setValue(0);
    expect(field.value).toBe(0);
    field.setValue(undefined);
    expect(field.value).toBeUndefined();
  });
});

// ========================================
// getFieldValue / getValueFromFormData
// ========================================

describe('Field getFieldValue / getValueFromFormData', () => {
  test('getFieldValue 经过 interceptor 输出', () => {
    const interceptor = {
      input: ({ value }) => value,
      output: ({ value }) => (typeof value === 'string' ? value.toUpperCase() : value)
    };
    const field = createField({ formInterceptor: interceptor, name: 'name' });
    field.setInfo({ label: 'test', rule: null, interceptor: null, noTrim: false, fieldRef: null, errMsg: '' });
    field.setFieldValue('hello');
    expect(field.value).toBe('hello');
    expect(field.getFieldValue()).toBe('HELLO');
  });

  test('getValueFromFormData 从 formData 取值', () => {
    const field = createReadyField();
    const formData = { username: 'test' };
    expect(field.getValueFromFormData(formData)).toBe('test');
  });

  test('getValueFromFormData 不存在的字段返回 undefined', () => {
    const field = createReadyField();
    const formData = { other: 'value' };
    expect(field.getValueFromFormData(formData)).toBeUndefined();
  });
});

// ========================================
// getErrState / getErrMsg
// ========================================

describe('Field 验证状态', () => {
  test('INIT 状态 getErrState 返回 0', () => {
    const field = createReadyField();
    expect(field.getErrState()).toBe(0);
  });

  test('PASS 状态 getErrState 返回 1', () => {
    const field = createReadyField();
    field.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
    expect(field.getErrState()).toBe(1);
  });

  test('ERROR 状态 getErrState 返回 2', () => {
    const field = createReadyField();
    field.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.ERROR;
    expect(field.getErrState()).toBe(2);
  });

  test('PENDING 状态 getErrState 返回 3', () => {
    const field = createReadyField();
    field.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.PENDING;
    expect(field.getErrState()).toBe(3);
  });

  test('getErrMsg 替换 %s 为 label', () => {
    const field = createReadyField();
    field.validate = { status: FORM_FIELD_VALIDATE_STATE_ENUM.ERROR, msg: '%s不能为空' };
    expect(field.getErrMsg()).toBe('用户名不能为空');
  });

  test('getErrMsg 支持 errMsg 属性', () => {
    const field = createReadyField();
    field.errMsg = '自定义错误';
    expect(field.getErrMsg()).toBe('自定义错误');
  });
});

// ========================================
// setValidateStatus
// ========================================

describe('Field setValidateStatus', () => {
  test('status=1 设为 PASS', () => {
    const field = createReadyField();
    field.setValidateStatus({ status: 1 });
    expect(field.validate.status).toBe(FORM_FIELD_VALIDATE_STATE_ENUM.PASS);
  });

  test('status=2 设为 ERROR', () => {
    const field = createReadyField();
    field.setValidateStatus({ status: 2 });
    expect(field.validate.status).toBe(FORM_FIELD_VALIDATE_STATE_ENUM.ERROR);
  });

  test('其他 status 设为 INIT', () => {
    const field = createReadyField();
    field.setValidateStatus({ status: 99 });
    expect(field.validate.status).toBe(FORM_FIELD_VALIDATE_STATE_ENUM.INIT);
  });

  test('合并 validateData', () => {
    const field = createReadyField();
    field.setValidateStatus({ status: 1, validateData: { a: 1 } });
    field.setValidateStatus({ status: 1, validateData: { b: 2 } });
    expect(field.validate.validateData).toEqual({ a: 1, b: 2 });
  });
});

// ========================================
// clone
// ========================================

describe('Field clone', () => {
  test('clone 产生独立副本', () => {
    const field = createReadyField();
    field.setValue('hello');
    const cloned = field.clone();
    expect(cloned.value).toBe('hello');
    cloned.setValue('world');
    expect(field.value).toBe('hello');
  });
});

// ========================================
// 静态方法
// ========================================

describe('Field 静态方法', () => {
  let formState;

  beforeEach(() => {
    const f1 = createReadyField();
    f1.setValue('value1');
    const f2 = createField({ id: 'field-2', name: 'email' });
    f2.setInfo({ label: '邮箱', rule: 'REQ EMAIL', interceptor: null, noTrim: false, fieldRef: null, errMsg: '' });
    f2.setValue('test@test.com');

    formState = new Map();
    formState.set('field-1', f1);
    formState.set('field-2', f2);
  });

  // findField
  test('findField 通过 id 查找', () => {
    const result = Field.findField(formState, { id: 'field-1' });
    expect(result.name).toBe('username');
  });

  test('findField 通过 name 查找', () => {
    const result = Field.findField(formState, { name: 'email' });
    expect(result.id).toBe('field-2');
  });

  test('findField 未找到返回 undefined', () => {
    const result = Field.findField(formState, { name: 'notexist' });
    expect(result).toBeUndefined();
  });

  // matchField
  test('matchField 匹配指定属性', () => {
    const f1 = formState.get('field-1');
    expect(Field.matchField(f1, { name: 'username' })).toBe(true);
    expect(Field.matchField(f1, { name: 'username', id: 'field-1' })).toBe(true);
    expect(Field.matchField(f1, { name: 'email' })).toBe(false);
  });

  // matchFields
  test('matchFields 无 groupName 返回单个匹配', () => {
    const result = Field.matchFields(formState, { name: 'username' });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('field-1');
  });

  // getFieldValuePath
  test('getFieldValuePath 无 group 返回 name', () => {
    expect(Field.getFieldValuePath({ name: 'username' })).toBe('username');
  });

  test('getFieldValuePath 有 group 返回路径', () => {
    expect(Field.getFieldValuePath({ groupName: 'users', groupIndex: 0, name: 'age' })).toBe('users["0"].age');
  });

  test('getFieldValuePath group 末段等于 name', () => {
    expect(Field.getFieldValuePath({ groupName: 'users', groupIndex: 0, name: 'users' })).toBe('users["0"]');
  });

  // computedFormDataFormState
  test('computedFormDataFormState 正确生成表单数据', () => {
    const data = Field.computedFormDataFormState(formState);
    expect(data.username).toBe('value1');
    expect(data.email).toBe('test@test.com');
  });

  // stateToIsPass
  test('stateToIsPass 全部通过为 true', () => {
    formState.forEach(f => {
      f.validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.PASS;
    });
    expect(Field.stateToIsPass(formState)).toBe(true);
  });

  test('stateToIsPass 有未通过为 false', () => {
    expect(Field.stateToIsPass(formState)).toBe(false);
  });

  // stateToError
  test('stateToError 收集错误字段', () => {
    formState.get('field-1').validate.status = FORM_FIELD_VALIDATE_STATE_ENUM.ERROR;
    formState.get('field-1').validate.msg = '必填';
    const errors = Field.stateToError(formState);
    expect(errors.length).toBe(1);
    expect(errors[0].name).toBe('username');
  });
});
