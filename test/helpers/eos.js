function mockAuthorization(_authorization = {}) {
  return {
    actor: expect.any(String),
    permission: expect.any(String),
    ..._authorization,
  };
}

function mockAction(_action = {}) {
  return {
    account: expect.any(String),
    name: expect.any(String),
    authorization: [mockAuthorization()],
    data: expect.any(Object),
    ..._action,
  };
}

function mockOptions(_options = {}) {
  return {
    blocksBehind: expect.any(Number),
    expireSeconds: expect.any(Number),
    ..._options,
  };
}

module.exports = {
  mockAction,
  mockAuthorization,
  mockOptions,
};
