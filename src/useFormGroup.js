import { useState } from 'react';

const useFormGroup = () => {
  const [group, setGroup] = useState({});

  return { group, setGroup };
};
export default useFormGroup;
