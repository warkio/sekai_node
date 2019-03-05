const path = require('path');
const crypto = require('crypto');

function randomString(length) {
    return crypto.randomBytes(length).toString('base64').substr(0, length)
}
// 'LMBw5lt1KYIlF5IzSq2/Bkr8XKjOOuMpoN2uiySOgYSI4iI2krH3YfxIOB6Gq6IBNoWzuAfdo8soTeP5NFMC'

module.exports = {
    // This will be overriden by `index.js`.
    env: null,

    http: {
        port: 3000,
        // Generate a random cookie key everytime you start the server
        cookiesKey: randomString(90),

        // String that should be prepended to `req.path` to get the public path
        // of the requested resource.
        //
        // Useful when using a reverse proxy.
        pathPrefix: '',
    },
    postgresql: {
        host: null,
        port: null,
        user: null,
        password: null,
        database: null,
    },
    logging: {
        root: path.join(__dirname, '..', 'logs'),
    }
};
