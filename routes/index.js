var db = require("../database.js");

exports.chat = function(req, res) {
  db.messages.find(function(err, messages) {
    if(err) {
      console.log('Err: ', err);
      return;
    } 
    res.render('chat', { title: 'Chatty', messages: messages });
  });
};

