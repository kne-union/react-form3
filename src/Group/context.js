import { createContext, useContext } from 'react';

const context = createContext({ id: 'root' });

export const { Provider } = context;

export const useGroupContext = () => {
  return useContext(context);
};

export default context;
