import { useEffect } from 'react';
import { useFormContext } from '../formContext';
import createFieldAddEvent from './event/createFieldAddEvent';
import createFieldChangeEvent from './event/createFieldChangeEvent';
import createFieldRemoveEvent from './event/createFieldRemoveEvent';
import createFieldSubmitEvent from './event/createFieldSubmitEvent';

const FormEvent = ({ children }) => {
  const formContext = useFormContext();
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useEffect(() => {
    const { emitter } = formContextRef.current;
    emitter.addListener('form:field:add', createFieldAddEvent(formContextRef));
    emitter.addListener('form:field:change', createFieldChangeEvent(formContextRef));
    emitter.addListener('form:field:remove', createFieldRemoveEvent(formContextRef));
    emitter.addListener('form:submit', createFieldSubmitEvent(formContextRef));
  }, []);
  return children;
};

export default FormEvent;
