import { runInterceptors } from '../core/interceptors';
import useRefCallback from '@kne/use-ref-callback';

const useInterceptors = ({ interceptors }) => {
  const input = useRefCallback(({ value, interceptor }) => {
      return runInterceptors(interceptors, 'input', interceptor)(value);
    }),
    output = useRefCallback(({ value, interceptor }) => {
      return runInterceptors(interceptors, 'output', interceptor)(value);
    });
  return { input, output };
};

export default useInterceptors;
