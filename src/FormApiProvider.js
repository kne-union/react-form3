import React, { createContext, useContext, useMemo, useRef } from 'react';

const context = createContext({});

const { Provider, Consumer } = context;
export const useFormApi = () => {
  const { openApiRef } = useContext(context);

  return useMemo(() => {
    return {
      get formData() {
        return openApiRef.current.data;
      },
      get formState() {
        return openApiRef.current.formState;
      },
      get openApi() {
        return openApiRef.current;
      },
      get isPass() {
        return openApiRef.current.isPass;
      },
      get errors() {
        return openApiRef.current.errors;
      },
      get emitter() {
        return openApiRef.current.emitter;
      }
    };
  }, [openApiRef]);
};

const FormApiProvider = ({ openApi, children }) => {
  const openApiRef = useRef(openApi);
  return <Provider value={{ openApiRef }}>{children}</Provider>;
};

export default FormApiProvider;
