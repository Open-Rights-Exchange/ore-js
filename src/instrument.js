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

function sortByMintedAt(instruments) {
  // sorts the instruments by minted_at property
  // minted_at represents the time when the instrument is either minted or updated
  instruments.sort((a, b) => {
    return a.instrument.minted_at - b.instrument.minted_at
  })
  return instruments[instruments.length - 1]
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

function sortInstruments(instruments, rightName, sortOrder = "cheapestThenMostRecent") {
  // sorts the instruments depending on the search criteria : 
  // cheapestThenMostRecent - returns the cheapest instrument for the right and if there are more than one with the same price, then returns the latest created/updated instrument
  // mostRecent - returns the latest instrument created/updated for the right
  let sortedInstruments;
  let cheapestInstrument;
  let cheapestPrice;
  let cheapestInstruments;

  const sortTypes = {
    1: "cheapestThenMostRecent",
    2: "mostRecent"
  }

  switch (sortOrder) {
    case sortTypes[1]:
    
      sortedInstruments = instruments.sort((a, b) => {
        const rightA = this.getRight(a, rightName)
        const rightB = this.getRight(b, rightName)
        return rightA.price_in_cpu - rightB.price_in_cpu
      })

      cheapestInstrument = sortedInstruments[0]
      cheapestPrice = this.getRight(cheapestInstrument, rightName).price_in_cpu;
      cheapestInstruments = sortedInstruments.filter(instrument => this.getRight(instrument, rightName).price_in_cpu === cheapestPrice)

      // if more than one instrument has the same price for the right, get the most recently updated
      if (cheapestInstruments.length > 0) {
        return sortByMintedAt(cheapestInstruments)
      }
      
      return cheapestInstrument

    case sortTypes[2]:    
    return sortByMintedAt(instruments)
  }
}

module.exports = {
  getRight,
  getAllInstruments,
  findInstruments,
  sortInstruments
};