import { useCallback, useEffect, useState } from 'react';
import getIdlePromise from './core/getIdlePromise';
import { useFormApi } from './Form/FormApiProvider';

const useSubmit = props => {
  const [isLoading, setIsLoading] = useState(false);
  const formApi = useFormApi();
  const { onClick } = Object.assign({}, props);
  useEffect(() => {
    const target = formApi.emitter.addListener('form:submit:complete', () => {
      setIsLoading(false);
    });
    return () => {
      target && target.remove();
    };
  }, [formApi.emitter]);

  return {
    isLoading,
    isPass: formApi.isPass,
    onClick: useCallback(
      async (...args) => {
        setIsLoading(true);
        try {
          await getIdlePromise();
          const returnArgs = onClick && (await onClick(...args));
          formApi.emitter.emit('form:submit', returnArgs || args);
        } catch (e) {
          console.error(e);
        }
      },
      [formApi.emitter, setIsLoading]
    )
  };
};

export default useSubmit;
