var db = require("../database.js");

exports.chat = function(req, res) {
  console.log('id: ' + req.params.id);

  db.messages.find(function(err, messages) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('chat', { messages: messages, asDate: formatDate });
  });
};

exports.topic = function(req, res) {
  db.topics.find(function(err, topics) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('topics', { topics: topics, asDate: formatDate });
  });
};

function formatDate(timestamp) {
  var date = new Date(timestamp);
  return date.getHours() + ':' + date.getMinutes();  
}