import createResetEvent from '../Form/event/createResetEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('createResetEvent', () => {
  test('reset 清空 pending 并触发 set-fields', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.setPath('title', 'old');
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'old' }));

    createResetEvent(formContextRef)();

    expect(pendingStore.hasPath('title')).toBe(false);
    expect(formContextRef.current.resetInitFormData).toHaveBeenCalled();
    expect(formContextRef.current.emitter.emit).toHaveBeenCalledWith('form:set-fields', expect.objectContaining({ runValidate: false }));
  });
});
