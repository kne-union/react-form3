import createFieldAddEvent from '../Form/event/createFieldAddEvent';
import { FORM_FIELD_STATE_ENUM } from '../core/Field';
import { createMockFormContext, defaultInterceptor } from '../test-utils/formTestUtils';

describe('createFieldAddEvent', () => {
  test('注册 PRE_INIT 字段并触发 mount', () => {
    const { formContextRef, formState } = createMockFormContext();
    formContextRef.current.interceptor = defaultInterceptor;
    const add = createFieldAddEvent(formContextRef);

    add({
      id: 'f1',
      name: 'title',
      associations: { fields: [{ name: 'city' }], callback: () => 'cb' }
    });

    const field = formState.get('f1');
    expect(field).toBeDefined();
    expect(field.name).toBe('title');
    expect(field.state).toBe(FORM_FIELD_STATE_ENUM.PRE_INIT);
    expect(field.isReady).toBe(false);
    expect(field.associations.fields).toEqual([{ name: 'city' }]);
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:mount:f1');
  });
});
