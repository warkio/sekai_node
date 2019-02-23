const defaultConfig = require('./default');
const productionConfig = require('./production');

module.exports = {
    ...productionConfig,

    postgresql: {
        database: 'sekai',
        host: '/var/run/postgresql',
    },
    http: {
        ...defaultConfig.http,

        port: 12002,
        pathPrefix: '/sekai',
    }
};
