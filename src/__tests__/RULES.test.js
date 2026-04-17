import RULES, { presetRules } from '../core/RULES';
import { isNotEmpty } from '../core/empty';

// ========================================
// REQ 规则
// ========================================

describe('RULES.REQ', () => {
  test('非空字符串通过', () => {
    expect(RULES.REQ('hello').result).toBe(true);
  });

  test('空字符串不通过', () => {
    expect(RULES.REQ('').result).toBe(false);
  });

  test('数字 0 通过', () => {
    expect(RULES.REQ(0).result).toBe(true);
  });

  test('false 通过', () => {
    expect(RULES.REQ(false).result).toBe(true);
  });

  test('null 不通过', () => {
    expect(RULES.REQ(null).result).toBe(false);
  });

  test('undefined 不通过', () => {
    expect(RULES.REQ(undefined).result).toBe(false);
  });

  test('空数组不通过', () => {
    expect(RULES.REQ([]).result).toBe(false);
  });

  test('非空数组通过', () => {
    expect(RULES.REQ([1]).result).toBe(true);
  });

  test('空对象不通过', () => {
    expect(RULES.REQ({}).result).toBe(false);
  });

  test('非空对象通过', () => {
    expect(RULES.REQ({ a: 1 }).result).toBe(true);
  });
});

// ========================================
// TEL 规则
// ========================================

describe('RULES.TEL', () => {
  test('有效手机号通过', () => {
    expect(RULES.TEL('13800138000').result).toBe(true);
  });

  test('无效手机号不通过', () => {
    expect(RULES.TEL('1234').result).toBe(false);
  });

  test('空值不通过', () => {
    expect(RULES.TEL('').result).toBe(false);
  });
});

// ========================================
// EMAIL 规则
// ========================================

describe('RULES.EMAIL', () => {
  test('有效邮箱通过', () => {
    expect(RULES.EMAIL('test@example.com').result).toBe(true);
  });

  test('无效邮箱不通过', () => {
    expect(RULES.EMAIL('invalid').result).toBe(false);
  });
});

// ========================================
// LEN 规则
// ========================================

describe('RULES.LEN', () => {
  test('长度在范围内通过', () => {
    expect(RULES.LEN('abc', 1, 5).result).toBe(true);
  });

  test('长度过短不通过', () => {
    expect(RULES.LEN('ab', 3, 5).result).toBe(false);
  });

  test('长度过长不通过', () => {
    expect(RULES.LEN('abcdef', 1, 5).result).toBe(false);
  });

  test('长度刚好等于指定值通过', () => {
    expect(RULES.LEN('abc', 3, 3).result).toBe(true);
  });

  test('长度不等于指定值不通过', () => {
    expect(RULES.LEN('ab', 3, 3).result).toBe(false);
  });

  test('数字值转字符串后校验', () => {
    expect(RULES.LEN(123, 1, 5).result).toBe(true);
  });
});

// ========================================
// presetRules
// ========================================

describe('presetRules', () => {
  test('添加自定义规则', () => {
    presetRules({ CUSTOM: value => ({ result: value === 'ok', errMsg: '不ok' }) });
    expect(RULES.CUSTOM('ok').result).toBe(true);
    expect(RULES.CUSTOM('no').result).toBe(false);
    // 清理
    delete RULES.CUSTOM;
  });
});

// ========================================
// isNotEmpty (从 empty 模块)
// ========================================

describe('isNotEmpty', () => {
  test('数字 0 不为空', () => {
    expect(isNotEmpty(0)).toBe(true);
  });

  test('false 不为空', () => {
    expect(isNotEmpty(false)).toBe(true);
  });

  test('null 为空', () => {
    expect(isNotEmpty(null)).toBe(false);
  });

  test('undefined 为空', () => {
    expect(isNotEmpty(undefined)).toBe(false);
  });

  test('空字符串为空', () => {
    expect(isNotEmpty('')).toBe(false);
  });

  test('非空字符串不为空', () => {
    expect(isNotEmpty('hello')).toBe(true);
  });

  test('NaN 为空', () => {
    expect(isNotEmpty(NaN)).toBe(false);
  });
});
