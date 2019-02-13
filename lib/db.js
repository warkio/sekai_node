const pgp = require('pg-promise')();

const config = require('../config').postgresql;
const client = pgp(config);

module.exports = {
    query: (text, params) => client.query(text, params),
    client,
    task: client.task
};
