import Field from '../../core/Field';
import { collectMountedPaths } from '../../core/pendingFormData';

const createFieldRemoveEvent =
  formContextRef =>
  ({ id }) => {
    const { setFormState, getFormState, pendingStore } = formContextRef.current;
    const field = getFormState().get(id);
    if (field && pendingStore && field.preserve !== false && field.value !== void 0) {
      const path = field.path || Field.getFieldValuePath(field);
      if (!pendingStore.isForgotten(path)) {
        pendingStore.setPath(path, field.value);
      }
    }
    setFormState(formState => {
      const newFormState = new Map(formState);
      newFormState.delete(id);
      return newFormState;
    });
    pendingStore && pendingStore.reconcile(collectMountedPaths(getFormState()));
  };

export default createFieldRemoveEvent;
