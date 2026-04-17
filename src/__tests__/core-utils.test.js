import compileErrMsg from '../core/compileErrMsg';
import groupKey from '../core/groupKey';
import getIdlePromise from '../core/getIdlePromise';

// ========================================
// compileErrMsg
// ========================================

describe('compileErrMsg', () => {
  test('字符串中 %s 替换为 label', () => {
    expect(compileErrMsg('%s不能为空', '用户名')).toBe('用户名不能为空');
  });

  test('字符串中无 %s 保持不变', () => {
    expect(compileErrMsg('格式错误', '用户名')).toBe('格式错误');
  });

  test('函数类型直接调用', () => {
    const fn = label => `${label}自定义错误`;
    expect(compileErrMsg(fn, '邮箱')).toBe('邮箱自定义错误');
  });

  test('空字符串', () => {
    expect(compileErrMsg('', '标签')).toBe('');
  });
});

// ========================================
// groupKey
// ========================================

describe('groupKey', () => {
  test('正常参数', () => {
    expect(groupKey('group-1', 'users')).toBe('group-1@users');
  });

  test('groupId 为空使用 root', () => {
    expect(groupKey(null, 'items')).toBe('root@items');
    expect(groupKey(undefined, 'items')).toBe('root@items');
  });
});

// ========================================
// getIdlePromise
// ========================================

describe('getIdlePromise', () => {
  test('返回一个 Promise', () => {
    const p = getIdlePromise();
    expect(p).toBeInstanceOf(Promise);
    return p;
  });

  test('Promise 在下一个微任务中 resolve', async () => {
    let resolved = false;
    getIdlePromise().then(() => {
      resolved = true;
    });
    expect(resolved).toBe(false);
    await getIdlePromise();
    expect(resolved).toBe(true);
  });
});
