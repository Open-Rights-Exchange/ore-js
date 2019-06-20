function expectFetch(...urls) {
  expect(fetch.mock.calls.length).toEqual(urls.length);
  urls.forEach((url, i) => {
    expect(fetch.mock.calls[i][0]).toEqual(url);
  });
}

function mock(body, status = 200) {
  return [
    JSON.stringify(body),
    {
      status
    }
  ];
}

function mockAbi() {
  return `{
    "version": "eosio::abi/1.0",
    "types": [],
    "structs": [{
        "name": "args",
        "base": "",
        "fields": [{
            "name": "name",
            "type": "string"
          },{
            "name": "value",
            "type": "string"
          }
        ]
      },{
        "name": "endpoint_url",
        "base": "",
        "fields": [{
            "name": "base_right",
            "type": "string"
          },{
            "name": "url",
            "type": "string"
          },{
            "name": "method",
            "type": "string"
          },{
            "name": "matches_params",
            "type": "args[]"
          },{
            "name": "token_life_span",
            "type": "uint64"
          },{
            "name": "is_default",
            "type": "bool"
          }
        ]
      },{
        "name": "right_reg",
        "base": "",
        "fields": [{
            "name": "id",
            "type": "uint64"
          },{
            "name": "right_name",
            "type": "string"
          },{
            "name": "owner",
            "type": "name"
          },{
            "name": "urls",
            "type": "endpoint_url[]"
          },{
            "name": "issuer_whitelist",
            "type": "name[]"
          }
        ]
      },{
        "name": "param_type",
        "base": "",
        "fields": [{
            "name": "type",
            "type": "string"
          },{
            "name": "values",
            "type": "args[]"
          }
        ]
      },{
        "name": "params",
        "base": "",
        "fields": [{
            "name": "params",
            "type": "args[]"
          }
        ]
      },{
        "name": "right",
        "base": "",
        "fields": [{
            "name": "right_name",
            "type": "string"
          },{
            "name": "description",
            "type": "string"
          },{
            "name": "price_in_cpu",
            "type": "string"
          },{
            "name": "additional_url_params",
            "type": "params[]"
          }
        ]
      },{
        "name": "instrument_data",
        "base": "",
        "fields": [{
            "name": "issuer",
            "type": "name"
          },{
            "name": "instrument_class",
            "type": "string"
          },{
            "name": "description",
            "type": "string"
          },{
            "name": "instrument_template",
            "type": "string"
          },{
            "name": "security_type",
            "type": "string"
          },{
            "name": "parameter_rules",
            "type": "param_type[]"
          },{
            "name": "rights",
            "type": "right[]"
          },{
            "name": "parent_instrument_id",
            "type": "uint64"
          },{
            "name": "data",
            "type": "args[]"
          },{
            "name": "mutability",
            "type": "uint8"
          }
        ]
      },{
        "name": "token",
        "base": "",
        "fields": [{
            "name": "id",
            "type": "uint64"
          },{
            "name": "owner",
            "type": "name"
          },{
            "name": "minted_by",
            "type": "name"
          },{
            "name": "minted_at",
            "type": "uint64"
          },{
            "name": "instrument",
            "type": "instrument_data"
          },{
            "name": "revoked",
            "type": "bool"
          },{
            "name": "start_time",
            "type": "uint64"
          },{
            "name": "end_time",
            "type": "uint64"
          },{
            "name": "template_hash",
            "type": "uint64"
          },{
            "name": "class_hash",
            "type": "uint64"
          }
        ]
      },{
        "name": "accountdata",
        "base": "",
        "fields": [{
            "name": "owner",
            "type": "name"
          },{
            "name": "balance",
            "type": "uint64"
          },{
            "name": "instruments",
            "type": "uint64[]"
          }
        ]
      },{
        "name": "account",
        "base": "",
        "fields": [{
            "name": "balance",
            "type": "asset"
          }
        ]
      },{
        "name": "currencystat",
        "base": "",
        "fields": [{
            "name": "supply",
            "type": "asset"
          },{
            "name": "max_supply",
            "type": "asset"
          },{
            "name": "issuer",
            "type": "name"
          }
        ]
      },{
        "name": "right_param",
        "base": "",
        "fields": [{
            "name": "right_name",
            "type": "string"
          },{
            "name": "urls",
            "type": "endpoint_url[]"
          },{
            "name": "whitelist",
            "type": "name[]"
          }
        ]
      },{
        "name": "offer_data",
        "base": "",
        "fields": [{
            "name": "id",
            "type": "uint64"
          },{
            "name": "name",
            "type": "string"
          },{
            "name": "rights",
            "type": "right_param[]"
          }
        ]
      },{
        "name": "offer_params",
        "base": "",
        "fields": [{
            "name": "right_name",
            "type": "string"
          },{
            "name": "right_description",
            "type": "string"
          },{
            "name": "right_price_in_cpu",
            "type": "string"
          },{
            "name": "api_name",
            "type": "string"
          },{
            "name": "api_description",
            "type": "string"
          },{
            "name": "api_price_in_cpu",
            "type": "string"
          },{
            "name": "api_payment_model",
            "type": "string"
          },{
            "name": "api_additional_url_params",
            "type": "string"
          }
        ]
      },{
        "name": "publishapi",
        "base": "",
        "fields": [{
            "name": "creator",
            "type": "name"
          },{
            "name": "issuer",
            "type": "name"
          },{
            "name": "api_instrument_license_price_in_cpu",
            "type": "string"
          },{
            "name": "api_instrument_lifetime_in_seconds",
            "type": "string"
          },{
            "name": "api_instrument_start_date",
            "type": "string"
          },{
            "name": "api_instrument_end_date",
            "type": "string"
          },{
            "name": "api_instrument_valid_forever",
            "type": "uint8"
          },{
            "name": "api_instrument_mutability",
            "type": "uint8"
          },{
            "name": "api_instrument_security_type",
            "type": "string"
          },{
            "name": "right_params",
            "type": "offer_params[]"
          },{
            "name": "api_instrument_parameter_rules",
            "type": "param_type[]"
          },{
            "name": "offer_mutability",
            "type": "uint8"
          },{
            "name": "offer_security_type",
            "type": "string"
          },{
            "name": "offer_template",
            "type": "string"
          },{
            "name": "offer_start_time",
            "type": "uint64"
          },{
            "name": "offer_end_time",
            "type": "uint64"
          },{
            "name": "offer_override_id",
            "type": "uint64"
          }
        ]
      },{
        "name": "licenseapi",
        "base": "",
        "fields": [{
            "name": "creator",
            "type": "name"
          },{
            "name": "buyer",
            "type": "name"
          },{
            "name": "offer_id",
            "type": "uint64"
          },{
            "name": "offer_template",
            "type": "string"
          },{
            "name": "override_instrument_id",
            "type": "uint64"
          }
        ]
      }
    ],
    "actions": [{
        "name": "publishapi",
        "type": "publishapi",
        "ricardian_contract": ""
      },{
        "name": "licenseapi",
        "type": "licenseapi",
        "ricardian_contract": ""
      }
    ],
    "tables": [{
        "name": "rights",
        "index_type": "i64",
        "key_names": [
          "id"
        ],
        "key_types": [
          "uint64"
        ],
        "type": "right_reg"
      },{
        "name": "tokens",
        "index_type": "i64",
        "key_names": [
          "id"
        ],
        "key_types": [
          "uint64"
        ],
        "type": "token"
      },{
        "name": "account",
        "index_type": "i64",
        "key_names": [
          "owner"
        ],
        "key_types": [
          "name"
        ],
        "type": "accountdata"
      },{
        "name": "accounts",
        "index_type": "i64",
        "key_names": [
          "balance"
        ],
        "key_types": [
          "asset"
        ],
        "type": "account"
      },{
        "name": "stat",
        "index_type": "i64",
        "key_names": [
          "supply"
        ],
        "key_types": [
          "asset"
        ],
        "type": "currencystat"
      },{
        "name": "offersdata",
        "index_type": "i64",
        "key_names": [
          "id"
        ],
        "key_types": [
          "uint64"
        ],
        "type": "offer_data"
      }
    ],
    "ricardian_clauses": [],
    "error_messages": [],
    "abi_extensions": [],
    "variants": []
  }`;
}

function mockAccount(account = {}) {
  return mock([{
    account_name: 'y4dcmrzgiyte',
    cpu_limit: {
      available: 12342451,
      max: 12342451,
      used: 0
    },
    cpu_weight: 10000,
    created: '2018-07-27T05:08:50.500',
    head_block_num: 925723,
    head_block_time: '2018-08-01T12:42:12.000',
    last_code_update: '1970-01-01T00:00:00.000',
    net_limit: {
      available: 64709992,
      max: 64709992,
      used: 0
    },
    net_weight: 10000,
    permissions: [{
      parent: '',
      perm_name: 'owner',
      required_auth: {
        accounts: [],
        keys: [{
          key: 'EOS7xvHh4RwHJhMYXQE8r3d6AkVpxYUQEiopQi5jM1q1JYRyJZZzX',
          weight: 1
        }],
        threshold: 1,
        waits: []
      }
    }, {
      parent: 'owner',
      perm_name: 'active',
      required_auth: {
        accounts: [],
        keys: [{
          key: 'EOS5QygD8vsKRXuVR8JMgLPjWwqzUyVGAJyvYaK7ffU4oPDmgwgqX',
          weight: 1
        }],
        threshold: 1,
        waits: []
      }
    }, {
      parent: 'active',
      perm_name: 'custom',
      required_auth: {
        accounts: [],
        keys: [{
          key: 'EOS5QygD8vsKRXuVR8JMgLPjWwqzUyVGAJyvYaK7ffU4oPDmgwgqX',
          weight: 1
        }],
        threshold: 1,
        waits: []
      }
    }],
    privileged: false,
    ram_quota: 8150,
    ram_usage: 2996,
    refund_request: null,
    self_delegated_bandwidth: null,
    total_resources: {
      cpu_weight: '1.0000 SYS',
      net_weight: '1.0000 SYS',
      owner: 'y4dcmrzgiyte',
      ram_bytes: 8150
    },
    voter_info: null,
    ...account
  }]);
}

function mockBlock(block = {}) {
  return mock([{
    timestamp: '2018-07-30T14:24:24.000',
    producer: 'eosio',
    confirmed: 0,
    previous: '00090a02e194bf83b406638a2165c69abdb6524aab0e0d9323e5788871501af9',
    transaction_mroot: '0000000000000000000000000000000000000000000000000000000000000000',
    action_mroot: 'b6ad4c65a79b1b43d223cfcbe3445b40e6fbd308a769fd8db9eed7404ecf2df7',
    schedule_version: 0,
    new_producers: null,
    header_extensions: [],
    producer_signature: 'SIG_K1_KbGoYqtV83Y7FeJ72sNNvmW7o3AMEMVug9HFPDovYTS6gZGERMdUs8neva44nMHB7qnUeSGn8A6PcuvZ9GR6mStChzMSD5',
    transactions: [],
    block_extensions: [],
    id: '00090a0384aa271b99b94d25a3d069c4387625e972d05c21ffa17180d1f09ec2',
    block_num: 592387,
    ref_block_prefix: 625850777,
    ...block
  }]);
}

function mockCode() {
  return '';
}

function mockError(error = {}) {
  return new Error({
    code: 500,
    message: 'Internal Service Error',
    error: {
      code: 3100002,
      name: 'unknown_block_exception',
      what: 'Unknown block',
      details: [],
      ...error
    }
  });
}

function mockInfo(info = {}) {
  return mock([{
    server_version: '75635168',
    chain_id: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
    head_block_num: 591911,
    last_irreversible_block_num: 591910,
    last_irreversible_block_id: '00090826ea7ed488caa5bf6b1e3ce25b5bd34f388249cc6893b473bc01c3416f',
    head_block_id: '00090827d92a0b18d95562ddb45bc213a09a2ab0d1a408e7d00e62e0cc70e69c',
    head_block_time: '2018-07-30T14:20:26.000',
    head_block_producer: 'eosio',
    virtual_block_cpu_limit: 200000000,
    virtual_block_net_limit: 1048576000,
    block_cpu_limit: 199900,
    lock_net_limit: 1048576,
    server_version_string: 'v1.4.2',
    ...info
  }]);
}

function mockInstrument(instrument = {}) {
  const innerInstrument = {
    issuer: 'company.acnt',
    instrument_class: 'company.apiVoucher',
    description: 'process an image and returns the list of objects found',
    instrument_template: '',
    security_type: 'pass',
    rights: [{
      right_name: 'company.manager.licenseApi',
      description: 'creates an api voucher to access com.company.right',
      price_in_cpu: '0',
      additional_url_params: []
    }],
    parent_instrument_id: 1,
    data: [],
    mutability: 1,
    ...instrument.instrument
  };

  return {
    id: 0,
    owner: 'app.acnt',
    minted_by: 'app.acnt',
    minted_at: Math.floor(Date.now() / 1000),
    revoked: 0,
    start_time: Math.floor(Date.now() / 1000) - 1,
    end_time: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // Expires in 30 days
    ...instrument,
    instrument: innerInstrument
  };
}

function mockInstruments(instruments = [{}]) {
  let idx = 1;
  return mock({
    rows: instruments.map((instrument) => {
      const instr = mockInstrument({
        id: idx,
        ...instrument
      });
      idx += 1;
      return instr;
    })
  });
}

function mockTransaction(transaction = {}) {
  return {
    transaction_id: '0',
    ...transaction
  };
}

export default {
  expectFetch,
  mock,
  mockAbi,
  mockAccount,
  mockBlock,
  mockCode,
  mockError,
  mockInfo,
  mockInstrument,
  mockInstruments,
  mockTransaction
};
