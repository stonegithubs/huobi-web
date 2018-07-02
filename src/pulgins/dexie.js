import Dexie from 'dexie';

const db = new Dexie('HUOBI');
db.version(1).stores({
  HUOBI_DEPTH: `++id ,action, symbol, time, timeUTC, asksList, bidsList`
});

export default db;
