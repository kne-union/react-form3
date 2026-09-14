import Field from '../../core/Field';

const createForgetGroupEvent =
  formContextRef =>
  ({ name, index, groupName }) => {
    const { pendingStore, getFormState } = formContextRef.current;
    if (!pendingStore) {
      return;
    }
    const targetGroupName = groupName || name;
    Array.from(getFormState().values()).forEach(field => {
      if (field.groupName === targetGroupName && (index == null || field.groupIndex === index)) {
        pendingStore.forget(field.path || Field.getFieldValuePath(field));
      }
    });
    if (targetGroupName != null && index != null) {
      pendingStore.shiftAfterGroupRemove(targetGroupName, index);
    } else if (targetGroupName) {
      pendingStore.forgetByPrefix(targetGroupName);
    }
  };

export default createForgetGroupEvent;
