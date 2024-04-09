import omit from 'lodash/omit';

const createFieldRemoveEvent =
  loadContext =>
  ({ id }) => {
    const { setFormState } = loadContext();
    setFormState(formState => omit(formState, [id]));
  };

export default createFieldRemoveEvent;
