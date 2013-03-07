var dbUrl = 'chatty';
var collections = ['topics', 'messages'];
var db = require('mongojs').connect(dbUrl, collections);

module.exports = db;