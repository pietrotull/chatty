var db = require('../database.js'),
  dateUtil = require('../dateUtil.js');

// start of new one page version of ui
exports.main = function(req, res) {
  db.topics.find(function(err, topics) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('index', { topics: topics, 
      asDate: dateUtil.asDate,
      asTime: dateUtil.asTime });
  });
};

exports.commentsByTopicId = function(req, res) {
  var topicId = db.ObjectId(req.params.topicId);
  db.comments.find({ "topicId" : topicId}, function(err, messages) {
    if(err) return;
    res.json(messages);
  });
}