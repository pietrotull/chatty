var dbUrl = 'chatty';
var collections = ['topics', 'messages'];
var db = require('mongojs').connect(dbUrl, collections);

db.saveMsg = function(msg) {
  db.messages.save({
  	username: msg.username, 
  	topicId: db.ObjectId(msg.topicId), 
  	content: msg.content, 
  	date: msg.date 
  });
}

module.exports = db;

