const fetch = require('node-fetch');
const eosjs = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const accounts = require('./accounts');
const cpu = require('./tokens/cpu');
const crypto = require('./modules/crypto');
const eos = require('./eos');
const instrument = require('./instrument');
const ore = require('./tokens/ore');
const oreStandardToken = require('./orestandardtoken');
const rightsRegistry = require('./rightsregistry');
const usageLog = require('./usagelog');

class Orejs {
  constructor(config = {}) {
    this.constructEos(config);

    /* Mixins */
    Object.assign(this, accounts);
    Object.assign(this, cpu);
    Object.assign(this, crypto);
    Object.assign(this, eos);
    Object.assign(this, instrument);
    Object.assign(this, ore);
    Object.assign(this, oreStandardToken);
    Object.assign(this, rightsRegistry);
    Object.assign(this, usageLog);
  }

  constructEos(config) {
    this.config = config;
    const rpc = new eosjs.JsonRpc(config.httpEndpoint, { fetch: config.fetch || fetch });
    const signatureProvider = new eosjs.JsSignatureProvider(config.keyProvider || []);
    this.eos = new eosjs.Api({ chainId: config.chainId, rpc, signatureProvider, textEncoder: new TextEncoder(), textDecoder: new TextDecoder() });
  }
}

module.exports = {
  crypto,
  Orejs,
};
