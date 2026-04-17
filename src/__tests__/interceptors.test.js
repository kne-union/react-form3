import interceptors, { runInterceptors } from '../core/interceptors';

// ========================================
// interceptors 基础
// ========================================

describe('interceptors 基础结构', () => {
  test('默认有 input 和 output 数组', () => {
    expect(Array.isArray(interceptors.input)).toBe(true);
    expect(Array.isArray(interceptors.output)).toBe(true);
  });

  test('use 方法注册拦截器', () => {
    const len = interceptors.input.length;
    interceptors.input.use('test-interceptor', value => value + '-processed');
    expect(interceptors.input.length).toBe(len + 1);
    // 清理
    interceptors.input.pop();
  });
});

// ========================================
// runInterceptors
// ========================================

describe('runInterceptors', () => {
  test('无匹配拦截器时返回原值', () => {
    const transform = runInterceptors({}, 'input', 'nonexist');
    expect(transform('hello')).toBe('hello');
  });

  test('匹配自定义拦截器执行转换', () => {
    const customInterceptors = {
      input: [{ name: 'upper', exec: value => value.toUpperCase() }]
    };
    const transform = runInterceptors(customInterceptors, 'input', 'upper');
    expect(transform('hello')).toBe('HELLO');
  });

  test('input 类型拦截器逆序执行', () => {
    const order = [];
    const customInterceptors = {
      input: [
        {
          name: 'first',
          exec: value => {
            order.push('first');
            return value;
          }
        },
        {
          name: 'second',
          exec: value => {
            order.push('second');
            return value;
          }
        }
      ]
    };
    const transform = runInterceptors(customInterceptors, 'input', ['first', 'second']);
    // input 类型会 reverse，变成 [second, first]，compose: second(first(value))
    // 所以 first 先执行，second 后执行
    transform('test');
    expect(order).toEqual(['first', 'second']);
  });

  test('output 类型拦截器顺序执行', () => {
    const order = [];
    const customInterceptors = {
      output: [
        {
          name: 'first',
          exec: value => {
            order.push('first');
            return value;
          }
        },
        {
          name: 'second',
          exec: value => {
            order.push('second');
            return value;
          }
        }
      ]
    };
    const transform = runInterceptors(customInterceptors, 'output', ['first', 'second']);
    // output 不 reverse，compose: first(second(value))，所以 second 先执行，first 后执行
    transform('test');
    expect(order).toEqual(['second', 'first']);
  });

  test('多个拦截器通过 compose 串联', () => {
    const customInterceptors = {
      output: [
        { name: 'double', exec: value => value * 2 },
        { name: 'addOne', exec: value => value + 1 }
      ]
    };
    const transform = runInterceptors(customInterceptors, 'output', ['double', 'addOne']);
    // output 不 reverse，compose: double(addOne(value))，先 addOne(5)=6，再 double(6)=12
    expect(transform(5)).toBe(12);
  });

  test('names 为字符串时转为数组', () => {
    const customInterceptors = {
      output: [{ name: 'double', exec: value => value * 2 }]
    };
    const transform = runInterceptors(customInterceptors, 'output', 'double');
    expect(transform(5)).toBe(10);
  });

  test('空 names 数组返回原值函数', () => {
    const transform = runInterceptors({}, 'input', []);
    expect(transform('hello')).toBe('hello');
  });
});
