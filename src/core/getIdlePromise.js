const getIdlePromise = (...args) => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve(...args);
    }, 0)
  );
};

export default getIdlePromise;
