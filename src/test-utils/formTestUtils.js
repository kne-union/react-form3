import Field, { FORM_FIELD_VALIDATE_STATE_ENUM } from '../core/Field';
import { createPendingStore } from '../core/pendingFormData';

export const defaultInterceptor = {
  input: ({ value }) => value,
  output: ({ value }) => value
};

export const createTestEmitter = () => {
  const listeners = {};
  return {
    emit: jest.fn((event, data) => {
      (listeners[event] || []).forEach(cb => cb(data));
    }),
    addListener: jest.fn((event, cb) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(cb);
      return {
        remove: () => {
          listeners[event] = (listeners[event] || []).filter(item => item !== cb);
        }
      };
    }),
    removeAllListeners: jest.fn(() => {
      Object.keys(listeners).forEach(key => {
        delete listeners[key];
      });
    })
  };
};

export const createMockFormContext = (initFormData = {}, pendingStore = createPendingStore()) => {
  const formState = new Map();
  const emitter = createTestEmitter();

  const formContextRef = {
    current: {
      initFormData,
      getInitFormData: () => initFormData,
      setInitFormData: next => {
        initFormData = next;
      },
      resetInitFormData: jest.fn(),
      pendingStore,
      debug: false,
      interceptor: defaultInterceptor,
      formState,
      getFormState: () => formState,
      setFormState: updater => {
        const newState = typeof updater === 'function' ? updater(formState) : updater;
        formState.clear();
        newState.forEach((v, k) => formState.set(k, v));
        return formState;
      },
      emitter
    }
  };

  return { formContextRef, formState, pendingStore };
};

export const createField = ({ id, name, groupName = null, groupIndex = null, ready = true, value, preserve } = {}) => {
  const field = new Field({ id, name, formInterceptor: defaultInterceptor });
  if (ready) {
    field.setInfo({
      groupName,
      groupIndex,
      label: name,
      rule: '',
      interceptor: null,
      noTrim: false,
      fieldRef: null,
      errMsg: '',
      preserve
    });
  }
  if (value !== void 0) {
    field.setValue(value);
  }
  return field;
};

export const markPass = field => {
  field.validate = { status: FORM_FIELD_VALIDATE_STATE_ENUM.PASS };
  return field;
};

export const markError = (field, msg = 'invalid') => {
  field.validate = { status: FORM_FIELD_VALIDATE_STATE_ENUM.ERROR, msg };
  return field;
};
