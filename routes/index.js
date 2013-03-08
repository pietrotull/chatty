var db = require("../database.js");

exports.chat = function(req, res) {

  var topicId = db.ObjectId(req.params.id);
  db.topics.findOne({ "_id" : topicId }, function(err, topic) {
    if(err) return;
    db.messages.find(function(err, messages) {
      if(err) {
        console.log('Err: ', err);
        return;
      } 
      res.render('chat', { topic: topic, messages: messages, asDate: asDate, asTime: asTime });
    });  
  });
};

// function 

exports.topic = function(req, res) {
  db.topics.find(function(err, topics) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('topics', { topics: topics, asDate: asDate, asTime: asTime });
  });
};

function asTime(timestamp) {
  var date = new Date(timestamp);
  return date.getHours() + ':' + date.getMinutes();  
}

function asDate(timestamp) {
  var date = new Date(timestamp);
  return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();  
}