import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from './formContext';
import getIdlePromise from './core/getIdlePromise';

const useSubmit = props => {
  const [isLoading, setIsLoading] = useState(false);
  const { isPass, emitter } = useFormContext();
  const { onClick } = Object.assign({}, props);
  useEffect(() => {
    const target = emitter.addListener('form:submit:complete', () => {
      setIsLoading(false);
    });
    return () => {
      target && target.remove();
    };
  }, [emitter]);
  return {
    isLoading,
    isPass,
    onClick: useCallback(
      async (...args) => {
        setIsLoading(true);
        try {
          await getIdlePromise();
          const returnArgs = onClick && (await onClick(...args));
          emitter.emit('form:submit', returnArgs || args);
        } catch (e) {
          console.error(e);
        }
<<<<<<< HEAD
        setIsLoading(false);
=======
>>>>>>> 17914d4 (修改submitbug)
      },
      [emitter, setIsLoading]
    )
  };
};

export default useSubmit;
