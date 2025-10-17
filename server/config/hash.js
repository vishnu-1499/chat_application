const CryptoJS = require("crypto-js");

exports.encPassword = (password, key) => {
    return CryptoJS.AES.encrypt(password, key).toString();
}

exports.decPassword = (password, key) => {
    const bytes = CryptoJS.AES.decrypt(password, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}