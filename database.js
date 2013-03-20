var dbUrl = 'chatty';
var collections = ['topics', 'comments'];
var db = require('mongojs').connect(dbUrl, collections);

db.saveComment = function(comment) {
  comment['topicId'] = db.ObjectId(comment.topicId);
  db.comments.save(comment);
}

module.exports = db;
