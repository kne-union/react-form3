import { useCallback } from 'react';
import { useFormContext } from './formContext';

const useReset = () => {
  const { emitter } = useFormContext();
  return {
    onClick: useCallback(() => {
      emitter.emit('form:reset');
    }, [emitter])
  };
};

export default useReset;
