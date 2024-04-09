import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useFormContext } from '../context';
import useRefCallback from '@kne/use-ref-callback';

const useValidate = ({ id, time }) => {
  const { formIsMount, emitter } = useFormContext();
  const checkValidate = useRefCallback(() => {
    formIsMount && emitter.emit('form-field-validate', { id });
  });
  const debouncedCheckValidate = useDebouncedCallback(checkValidate, time),
    cancel = debouncedCheckValidate.cancel;
  useEffect(() => {
    const subscription = emitter.addListener('form-data-reset', cancel);
    return () => {
      subscription && subscription.remove();
    };
  }, [emitter, cancel]);

  return time ? debouncedCheckValidate : checkValidate;
};

export default useValidate;
