const INSTR_CONTRACT_NAME = 'instr.ore';
const INSTR_TABLE_NAME = 'tokens';

/* Private */
// NOTE: if the endTime is 0, the instrument is valid forever
function isActive(instrument) {
  const startTime = instrument.start_time;
  const endTime = instrument.end_time;
  const currentTime = Math.floor(Date.now() / 1000);
  return (currentTime > startTime && (currentTime < endTime || endTime == 0));
}

function hasCategory(instrument, category) {
  if (instrument.instrument.instrument_class === category) {
    return true;
  }
  return false;
}

async function getInstruments(params) {
  // Returns instruments indexed by owner/instrumentTemplate/instrumentClass
  // Returns all instruments by default
  let keyType;
  let index;
  let results = [];
  const lowerBound = 0;
  const upperBound = -1;
  const limit = -1;
  if (params.key_name === 'owner') {
    keyType = 'i64';
    index = 2;
  } else if (params.key_name === 'instrument_template') {
    keyType = 'i64';
    index = 3;
  } else if (params.key_name === 'instrument_class') {
    keyType = 'i64';
    index = 4;
  } else {
    // index by instrument_id
    keyType = 'i64';
    index = 1;
  }
  const parameters = {
    ...params,
    json: true,
    lower_bound: params.lower_bound || lowerBound,
    upper_bound: params.upper_bound || upperBound,
    scope: params.scope || params.code,
    limit: params.limit || limit,
    key_type: keyType || 'i64',
    index_position: index || 1,
  };
  results = await this.eos.rpc.get_table_rows(parameters);
  return results.rows;
}

/* Public */
async function getAllInstruments() {
  // Returns all the instruments
  const instruments = await getInstruments.bind(this)({
    code: 'instr.ore',
    table: 'tokens',
  });
  return instruments;
}

function getRight(instrument, rightName) {
  const {
    instrument: {
      rights,
    } = {},
  } = instrument;

  const right = rights.find((rightObject) => {
    if (rightObject.right_name === rightName) {
      return rightObject;
    }
    return undefined;
  });
  return right;
}

async function findInstruments(oreAccountName, activeOnly = true, category = undefined, rightName = undefined) {
  // Where args is search criteria could include (category, rights_name)
  // It gets all the instruments owned by a user using secondary index on the owner key
  // Note: this requires an index on the rights collection (to filter right names)

  let instruments = await getInstruments.bind(this)({
    code: 'instr.ore',
    table: 'tokens',
    lower_bound: oreAccountName,
    key_name: 'owner',
  });

  if (activeOnly) {
    instruments = instruments.filter(element => isActive(element));
  }

  if (category) {
    instruments = instruments.filter(element => hasCategory(element, category));
  }

  if (rightName) {
    instruments = await this.getInstrumentsByRight.bind(this)(instruments, rightName);
  }

  return instruments;
}

module.exports = {
  getRight,
  getAllInstruments,
  findInstruments,
};
