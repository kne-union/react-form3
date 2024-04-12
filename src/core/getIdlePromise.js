const getIdlePromise = () => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, 0)
  );
};

export default getIdlePromise;
