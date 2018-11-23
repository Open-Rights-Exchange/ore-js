let orejs = require('./index').orejs();

(async () => {
  // Grab the current chain id...
  const info = await orejs.eos.rpc.get_info({});
  console.log('Connecting to chain:', info.chain_id, '...');
  process.env.CHAIN_ID = info.chain_id;

  // Reinitialize the orejs library, with the appropriate chain id...
  orejs = require('./index').orejs();

  // async function getAllTableRows(params, key_field = 'id', json = true) {
  let rows = await orejs.getAllTableRows({
    code: 'instr.ore',
    scope: 'instr.ore',
    table: 'tokens',
    limit: -1,
  });
  console.log("Rows:", rows);
})();
