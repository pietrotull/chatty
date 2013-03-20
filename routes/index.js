var db = require('../database.js'),
  dateUtil = require('../dateUtil.js');

exports.chat = function(req, res) {

  var topicId = db.ObjectId(req.params.id);
  db.topics.findOne({ "_id" : topicId }, function(err, topic) {
    if(err) { 
      console.log('1Err: ', err);
      return;
    }

    db.comments.find({ "topicId" : topicId}, function(err, comments) {
      if(err) {
        console.log('2Err: ', err);
        return;
      } 
      res.render('chat', { topic: topic, 
        comments: comments, 
        asDate: dateUtil.asDate, 
        asTime: dateUtil.asTime });
    });  
  });
};

exports.topic = function(req, res) {
  db.topics.find(function(err, topics) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('topics', { topics: topics, 
      asDate: dateUtil.asDate,
      asTime: dateUtil.asTime });
  });
};

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