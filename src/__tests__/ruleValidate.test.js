import ruleValidate from '../core/ruleValidate';
import RULES from '../core/RULES';

const createMockField = rule => ({
  name: 'test',
  rule,
  label: '测试'
});

const getFormData = () => ({});

// ========================================
// function 类型规则
// ========================================

describe('ruleValidate - function 类型规则', () => {
  test('自定义函数规则返回结果', async () => {
    const field = createMockField(value => ({
      result: value === 'ok',
      errMsg: '不ok'
    }));
    const res = await ruleValidate({ field, value: 'ok', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('自定义函数规则返回失败', async () => {
    const field = createMockField(value => ({
      result: value !== 'ok',
      errMsg: '不ok'
    }));
    const res = await ruleValidate({ field, value: 'ok', formRules: RULES, getFormData });
    expect(res.result).toBe(false);
    expect(res.errMsg).toBe('不ok');
  });
});

// ========================================
// RegExp 类型规则
// ========================================

describe('ruleValidate - RegExp 类型规则', () => {
  test('正则规则匹配成功', async () => {
    const field = createMockField(/^\d+$/);
    const res = await ruleValidate({ field, value: '123', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('正则规则匹配失败', async () => {
    const field = createMockField(/^\d+$/);
    const res = await ruleValidate({ field, value: 'abc', formRules: RULES, getFormData });
    expect(res.result).toBe(false);
  });
});

// ========================================
// string 类型规则
// ========================================

describe('ruleValidate - string 类型规则', () => {
  test('REQ 规则 - 非空值通过', async () => {
    const field = createMockField('REQ');
    const res = await ruleValidate({ field, value: 'hello', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('REQ 规则 - 空值不通过', async () => {
    const field = createMockField('REQ');
    const res = await ruleValidate({ field, value: '', formRules: RULES, getFormData });
    expect(res.result).toBe(false);
  });

  test('EMAIL 规则 - 空值跳过非 REQ 规则返回 true', async () => {
    const field = createMockField('EMAIL');
    const res = await ruleValidate({ field, value: '', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('组合规则 REQ EMAIL - 空值不通过 REQ', async () => {
    const field = createMockField('REQ EMAIL');
    const res = await ruleValidate({ field, value: '', formRules: RULES, getFormData });
    expect(res.result).toBe(false);
  });

  test('组合规则 REQ EMAIL - 无效邮箱不通过', async () => {
    const field = createMockField('REQ EMAIL');
    const res = await ruleValidate({ field, value: 'invalid', formRules: RULES, getFormData });
    expect(res.result).toBe(false);
  });

  test('组合规则 REQ EMAIL - 有效值通过', async () => {
    const field = createMockField('REQ EMAIL');
    const res = await ruleValidate({ field, value: 'test@example.com', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('数字 0 通过 REQ 规则', async () => {
    const field = createMockField('REQ');
    const res = await ruleValidate({ field, value: 0, formRules: RULES, getFormData });
    expect(res.result).toBe(true);
  });

  test('不存在的规则打印错误但不会崩溃', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const field = createMockField('NONEXIST');
    const res = await ruleValidate({ field, value: 'test', formRules: RULES, getFormData });
    expect(res.result).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
