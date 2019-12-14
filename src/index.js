const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');

const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');
const accounts = require('./accounts');
const cpu = require('./tokens/cpu');
const compose = require('./compose');
const createbridge = require('./createbridge');
const crypto = require('./modules/crypto');
const eos = require('./eos');
const errors = require('./errors');
const helpers = require('./helpers');
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
    Object.assign(this, compose);
    Object.assign(this, cpu);
    Object.assign(this, createbridge);
    Object.assign(this, crypto);
    Object.assign(this, eos);
    Object.assign(this, errors);
    Object.assign(this, helpers);
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
    this.unusedAccountPubKey = config.unusedAccountPubKey || null;
    this.rpc = new JsonRpc(config.httpEndpoint, { fetch: config.fetch || fetch });
    this.signatureProvider = config.signatureProvider || new JsSignatureProvider(config.privateKeys || []);
    this.eos = new Api({
      chainId: config.chainId,
      rpc: this.rpc,
      signatureProvider: this.signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    });
  }
}

const generateAccountNameString = accounts.generateAccountNameString;

module.exports = {
  compose,
  crypto,
  errors,
  generateAccountNameString,
  hexToUint8Array: eos.hexToUint8Array,
  isValidPublicKey: eos.isValidPublicKey,
  Orejs,
  JsSignatureProvider
};
