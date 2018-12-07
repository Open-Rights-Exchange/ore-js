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
    blocksBehind: 3,
    broadcast: true,
    expireSeconds: 30,
    ..._options,
  };
}

module.exports = {
  mockAction,
  mockAuthorization,
  mockOptions,
};
