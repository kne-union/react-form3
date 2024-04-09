import Field from '../core/Field';

const createFieldAssociationsEvent =
  loadContext =>
  ({ target }) => {
    const { formState, openApi } = loadContext();

    Field.matchAssociationFields(formState, target).forEach(field => {
      field.associations?.callback({ target: field, origin: target, openApi });
    });
  };

export default createFieldAssociationsEvent;
