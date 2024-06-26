import compose from '@kne/compose';
import uniqBy from 'lodash/uniqBy';
import get from 'lodash/get';

const interceptors = {
  input: [],
  output: []
};

interceptors.input.use = (name, func) => {
  return interceptors.input.push({
    name,
    exec: func
  });
};

interceptors.output.use = (name, func) => {
  return interceptors.output.push({
    name,
    exec: func
  });
};

export default interceptors;

const baseInterceptors = interceptors;

export const runInterceptors = (interceptors, type, names) => {
  if (!Array.isArray(names)) {
    names = [names];
  }

  const currentInterceptors = uniqBy(
    baseInterceptors[type]
      .concat(get(interceptors, type, []))
      .filter(({ name }) => names.indexOf(name) > -1)
      .reverse(),
    ({ name }) => name
  );

  if (currentInterceptors.length === 0) {
    return value => value;
  }
  return compose(...currentInterceptors.map(({ exec }) => exec));
};
