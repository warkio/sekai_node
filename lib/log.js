const path = require('path');

const winston = require('winston');

const config = require('../config');

const ROOT_DIR = config.logging.root;

const FILE_ERRORS = path.join(ROOT_DIR, 'error.log');
const FILE_INFO = path.join(ROOT_DIR, 'info.log');

let transports = null;
if (config.env === 'production') {
    transports = [
        new winston.transports.File({
            filename: FILE_ERRORS,
            level: 'error',
        }),
        new winston.transports.File({
            filename: FILE_INFO,
        }),
    ];
} else {
    transports = [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.simple(),
        }),
    ];
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports,
});

function debug(...args) {
    return logger.log('debug', ...args);
}

function info(...args) {
    return logger.log('info', ...args);
}

function error(...args) {
    return logger.log('error', ...args);
}

exports.debug = debug;
exports.info = info;
exports.error = error;
