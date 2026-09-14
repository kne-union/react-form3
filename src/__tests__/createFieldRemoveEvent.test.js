import createFieldRemoveEvent from '../Form/event/createFieldRemoveEvent';
import { createField, createMockFormContext } from '../test-utils/formTestUtils';

describe('createFieldRemoveEvent', () => {
  test('默认 preserve 卸载时写入 pending', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'keep-me' }));
    const remove = createFieldRemoveEvent(formContextRef);

    remove({ id: 'f1' });

    expect(formState.has('f1')).toBe(false);
    expect(pendingStore.getPath('title')).toBe('keep-me');
  });

  test('preserve=false 卸载不写入 pending', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'drop', preserve: false }));
    const remove = createFieldRemoveEvent(formContextRef);

    remove({ id: 'f1' });

    expect(pendingStore.hasPath('title')).toBe(false);
  });

  test('已 forget 的 path 卸载不再写回 pending', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    pendingStore.forget('title');
    formState.set('f1', createField({ id: 'f1', name: 'title', value: 'should-not-restore' }));
    const remove = createFieldRemoveEvent(formContextRef);

    remove({ id: 'f1' });

    expect(pendingStore.hasPath('title')).toBe(false);
    expect(pendingStore.isForgotten('title')).toBe(true);
  });

  test('value 为 undefined 时不写 pending', () => {
    const { formContextRef, formState, pendingStore } = createMockFormContext();
    formState.set('f1', createField({ id: 'f1', name: 'title' }));
    const remove = createFieldRemoveEvent(formContextRef);

    remove({ id: 'f1' });

    expect(pendingStore.hasPath('title')).toBe(false);
  });
});
