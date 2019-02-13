const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = require('./default');

let env = process.env.NODE_ENV || 'development';

switch (env) {
case 'development':
case 'staging':
case 'production':
    break;
default:
    env = 'development';

    break;
}

let config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

const configFile = path.join(__dirname, `${env}.js`);
if (fs.existsSync(configFile)) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    config = Object.assign(config, require(configFile));
}

config.env = env;

module.exports = config;
