function mockAuthorization(_authorization = {}) {
  return {
    actor: expect.any(String),
    permission: expect.any(String),
    ..._authorization
  };
}

function mockAction(_action = {}) {
  const authorization = _action.authorization;
  delete _action.authorization;

  return {
    account: expect.any(String),
    name: expect.any(String),
    authorization: [mockAuthorization(authorization)],
    data: expect.any(Object),
    ..._action
  };
}

function mockOptions(_options = {}) {
  return {
    blocksBehind: 3,
    broadcast: true,
    expireSeconds: 30,
    ..._options
  };
}

export default {
  mockAction,
  mockAuthorization,
  mockOptions
};
