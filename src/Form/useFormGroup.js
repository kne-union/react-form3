import { useState } from 'react';

const useFormGroup = () => {
  const [group, setGroup] = useState(new Map());

  return { group, setGroup };
};
export default useFormGroup;
