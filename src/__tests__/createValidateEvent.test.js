import createValidateEvent from '../Form/event/createValidateEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('createValidateEvent', () => {
  test('对每个字段发出 form-field:validate', () => {
    const { formContextRef, formState } = createMockFormContext();
    formState.set('a', createField({ id: 'a', name: 'title' }));
    formState.set('b', createField({ id: 'b', name: 'email' }));
    formContextRef.current.formState = formState;

    createValidateEvent(formContextRef)();

    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:validate:a');
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form-field:validate:b');
  });
});
