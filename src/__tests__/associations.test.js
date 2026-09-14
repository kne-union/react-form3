import Field from '../core/Field';
import { createField, defaultInterceptor } from '../test-utils/formTestUtils';

describe('字段 associations', () => {
  test('matchAssociationFields 找到声明了 origin 的目标字段', () => {
    const formState = new Map();
    const origin = createField({ id: 'city', name: 'city', value: 'SH' });
    const target = new Field({
      id: 'district',
      name: 'district',
      formInterceptor: defaultInterceptor,
      associations: {
        fields: [{ name: 'city' }],
        callback: jest.fn()
      }
    });
    target.setInfo({ groupName: null, groupIndex: null, label: 'district' });
    formState.set('city', origin);
    formState.set('district', target);

    const matched = Field.matchAssociationFields(formState, origin);
    expect(matched).toHaveLength(1);
    expect(matched[0].id).toBe('district');
  });

  test('不匹配自己，也不匹配未声明关联的字段', () => {
    const formState = new Map();
    const origin = createField({ id: 'city', name: 'city', value: 'SH' });
    const other = createField({ id: 'title', name: 'title', value: 'x' });
    formState.set('city', origin);
    formState.set('title', other);

    expect(Field.matchAssociationFields(formState, origin)).toEqual([]);
  });

  test('associations.fields 为空时不匹配', () => {
    const formState = new Map();
    const origin = createField({ id: 'city', name: 'city', value: 'SH' });
    const empty = new Field({
      id: 'district',
      name: 'district',
      formInterceptor: defaultInterceptor,
      associations: { fields: [], callback: jest.fn() }
    });
    empty.setInfo({ groupName: null, groupIndex: null, label: 'district' });
    formState.set('city', origin);
    formState.set('district', empty);

    expect(Field.matchAssociationFields(formState, origin)).toEqual([]);
  });

  test('匹配后调用目标 callback', () => {
    const callback = jest.fn();
    const formState = new Map();
    const origin = createField({ id: 'city', name: 'city', value: 'SH' });
    const target = new Field({
      id: 'district',
      name: 'district',
      formInterceptor: defaultInterceptor,
      associations: { fields: [{ name: 'city' }], callback }
    });
    target.setInfo({ groupName: null, groupIndex: null, label: 'district' });
    formState.set('city', origin);
    formState.set('district', target);

    const openApi = { setField: jest.fn() };
    Field.matchAssociationFields(formState, origin).forEach(field => {
      field.associations.callback({ target: field, origin, openApi });
    });

    expect(callback).toHaveBeenCalledWith({ target, origin, openApi });
  });
});
