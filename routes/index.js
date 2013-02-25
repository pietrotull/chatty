var db = require("../database.js");

// exports.books = {};

exports.index = function(req, res){
  res.render('index', { title: 'Chatty' });
};

exports.chat = function(req, res) {
  db.messages.find(function(err, messages) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    // res.json(messages);
    res.render('chat', { title: 'Chatty', messages: messages });
  });
};

