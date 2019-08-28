const config = require('../config').postgresql;
//const pgp = require('pg-promise')();
const initOptions = config.initOptions;
const configOptions = config.dbConfig;
const pgp = require('pg-promise')(initOptions);

const client = pgp(configOptions);

module.exports = {
    query: (text, params) => client.query(text, params),
    client,
    task: client.task
};
