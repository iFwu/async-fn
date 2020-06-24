const setImmediatePromise = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

export default () => {
  const callStack = [];
  const asyncFn = jest.fn();

  asyncFn.resolveLastCall = (...rest) => {
    const lastCall = callStack.pop();

    if (!lastCall) {
      throw new Error(
        "Tried to resolve an asyncFn call that has not been made yet."
      );
    }

    return lastCall.resolve(...rest);
  };

  asyncFn.rejectLastCall = (...rest) => {
    const lastCall = callStack.pop();

    if (!lastCall) {
      throw new Error(
        "Tried to reject an asyncFn call that has not been made yet."
      );
    }

    return lastCall.reject(...rest);
  };

  asyncFn.resolveFirstUnresolvedCall = (...rest) => {
    const firstCall = callStack.shift();

    if (!firstCall) {
      throw new Error(
        "Tried to resolve an asyncFn call that has not been made yet."
      );
    }

    return firstCall.resolve(...rest);
  };

  asyncFn.mockImplementation(() => {
    let resolve;
    let reject;

    const callPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    callStack.push({
      resolve: (...rest) => {
        resolve(...rest);
        return setImmediatePromise();
      },
      reject: (...rest) => {
        reject(...rest);
        return setImmediatePromise();
      },
    });

    return callPromise;
  });

  return asyncFn;
};