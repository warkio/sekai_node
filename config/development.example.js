const defaultConfig = require('./default');

module.exports = {
    postgresql: {
        host: 'localhost',
        port: '5432',
        user: 'sekai_node',
        password: 'sekai_node',
        database: 'sekai_node',
        min: 20,
        max: 100
    }
};
