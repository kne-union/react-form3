import getFieldUtils from '../core/getFieldUtils';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('getFieldUtils', () => {
  test('getField 对 clone 回调，找不到则跳过', () => {
    const { formContextRef, formState } = createMockFormContext();
    const field = createField({ id: 'f1', name: 'title', value: 'old' });
    formState.set('f1', field);
    const { getField } = getFieldUtils(formContextRef);
    const missing = jest.fn();

    expect(getField('missing', missing)).toBeUndefined();
    expect(missing).not.toHaveBeenCalled();

    getField('f1', clone => {
      expect(clone).not.toBe(field);
      expect(clone.value).toBe('old');
      clone.setValue('next');
    });
    expect(field.value).toBe('old');
  });

  test('setFieldInfo 写回 Map；字段已卸载则不动', () => {
    const { formContextRef, formState } = createMockFormContext();
    const field = createField({ id: 'f1', name: 'title', value: 'old' });
    formState.set('f1', field);
    const { getField, setFieldInfo } = getFieldUtils(formContextRef);

    getField('f1', clone => {
      clone.setValue('next');
      setFieldInfo(clone);
    });
    expect(formState.get('f1').value).toBe('next');

    formState.delete('f1');
    const orphan = createField({ id: 'f1', name: 'title', value: 'ghost' });
    setFieldInfo(orphan);
    expect(formState.has('f1')).toBe(false);
  });
});
