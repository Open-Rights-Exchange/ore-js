const fetch = require('node-fetch');
const eosjs = require('eosjs');
// JsSignatureProvider is used in Frontend only, not safe for private keys and signing
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextDecoder, TextEncoder } = require('text-encoding');
const accounts = require('./accounts');
const cpu = require('./tokens/cpu');
const creatbridge = require('./createbridge');
const crypto = require('./modules/crypto');
const eos = require('./eos');
const instrument = require('./instrument');
const ore = require('./tokens/ore');
const oreStandardToken = require('./orestandardtoken');
const rightsRegistry = require('./rightsregistry');
const usageLog = require('./usagelog');
const verifier = require('./verifier');

class Orejs {
  constructor(config = {}) {
    this.constructEos(config);

    /* Mixins */
    Object.assign(this, accounts);
    Object.assign(this, cpu);
    Object.assign(this, creatbridge);
    Object.assign(this, crypto);
    Object.assign(this, eos);
    Object.assign(this, instrument);
    Object.assign(this, ore);
    Object.assign(this, oreStandardToken);
    Object.assign(this, rightsRegistry);
    Object.assign(this, usageLog);
    Object.assign(this, verifier);
  }

  constructEos(config) {
    this.config = config;
    this.chainName = config.chainName || 'ore'; // ore || eos
    this.rpc = new eosjs.JsonRpc(config.httpEndpoint, { fetch: config.fetch || fetch });
    this.signatureProvider = config.signatureProvider || new JsSignatureProvider(config.privateKeys || []);
    this.eos = new eosjs.Api({
      chainId: config.chainId,
      rpc: this.rpc,
      signatureProvider: this.signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
  }
}

module.exports = {
  crypto,
  generateAccountNameString: accounts.generateAccountNameString,
  Orejs
};
