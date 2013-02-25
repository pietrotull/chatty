var dbUrl = 'chatty';
var collections = ['messages'];
var db = require('mongojs').connect(dbUrl, collections);

module.exports = db;