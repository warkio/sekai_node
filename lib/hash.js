const crypto = require('crypto');

exports.generateSalt = (length)=> {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
};

exports.SHA512 = (element,salt) => {
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(element);
    return hash.digest('hex');
};