import getFieldValue from '../core/getFieldValue';

describe('getFieldValue', () => {
  test('非事件对象原样返回', () => {
    expect(getFieldValue('plain')).toBe('plain');
    expect(getFieldValue(0)).toBe(0);
    expect(getFieldValue(false)).toBe(false);
  });

  test('带 preventDefault 的文本事件取 target.value', () => {
    const event = {
      preventDefault() {},
      target: { type: 'text', value: 'typed' }
    };
    expect(getFieldValue(event)).toBe('typed');
  });

  test('checkbox / radio 取 target.checked', () => {
    expect(
      getFieldValue({
        preventDefault() {},
        target: { type: 'checkbox', checked: true, value: 'on' }
      })
    ).toBe(true);
    expect(
      getFieldValue({
        preventDefault() {},
        target: { type: 'radio', checked: false, value: 'a' }
      })
    ).toBe(false);
  });

  test('第二个参数显式传入时优先于 event.target', () => {
    const event = {
      preventDefault() {},
      target: { type: 'text', value: 'typed' }
    };
    expect(getFieldValue(event, 'override')).toBe('override');
  });
});
