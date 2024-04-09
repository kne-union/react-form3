import { useEffect, useRef } from 'react';
import { useFormContext } from './context';
import useRefCallback from '@kne/use-ref-callback';
import {
  createFieldAddEvent,
  createFieldAssociationsEvent,
  createFieldDataChangeEvent,
  createFieldEditEvent,
  createFieldRemoveEvent,
  createFieldSetDataEvent,
  createFieldValidateEvent,
  createFormResetDataEvent,
  createFormSetDataEvent,
  createFormSubmitEvent,
  createFormValidateEvent,
  createGroupChangeEvent,
  createGroupRemoveEvent
} from './event';

const FormEvent = ({ children }) => {
  const formContext = useFormContext();
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  const { emitter } = formContext;

  const bingFormEventHandler = useRefCallback(() => {
    emitter.addListener(
      'form-field-add',
      createFieldAddEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-field-edit',
      createFieldEditEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-field-remove',
      createFieldRemoveEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-field-data-change',
      createFieldDataChangeEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-field-validate',
      createFieldValidateEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-field-value-change',
      createFieldAssociationsEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-data-set-field',
      createFieldSetDataEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-data-set-field-list',
      createFieldSetDataEvent(() => formContextRef.current)
    );

    emitter.addListener(
      'form-group-change',
      createGroupChangeEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-group-remove',
      createGroupRemoveEvent(() => formContextRef.current)
    );

    emitter.addListener(
      'form-data-set',
      createFormSetDataEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-data-reset',
      createFormResetDataEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-validate-all',
      createFormValidateEvent(() => formContextRef.current)
    );
    emitter.addListener(
      'form-submit',
      createFormSubmitEvent(() => formContextRef.current)
    );

    return () => {
      emitter.removeAllListeners();
    };
  });

  useEffect(() => {
    return bingFormEventHandler();
  }, [bingFormEventHandler]);

  return children;
};

export default FormEvent;
