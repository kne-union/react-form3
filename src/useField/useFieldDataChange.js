import { useState } from 'react';
import getFieldValue from './getFieldValue';
import { useFormContext } from '../context';
import useRefCallback from '@kne/use-ref-callback';

const useFieldDataChange = ({ id, onChange }) => {
  const { emitter } = useFormContext();
  const [isValueChanged, setIsValueChanged] = useState(false);
  const handlerChange = useRefCallback((...args) => {
    onChange && onChange(...args);
    setIsValueChanged(true);
    const value = getFieldValue(...args);
    emitter.emit('form-field-data-change', { value, id });
  });

  return {
    isValueChanged,
    onChange: handlerChange
  };
};

export default useFieldDataChange;
