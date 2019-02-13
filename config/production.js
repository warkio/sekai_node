const defaultConfig = require('./default');

module.exports = {
    postgresql: {
        host: 'localhost',
        port: '5432',
        user: 'sekai',
        password: 'sekai',
        database: 'sekai',
        min: 20,
        max: 100
    }
};
