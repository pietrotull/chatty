var socketio = require('socket.io'),
    db = require("./database.js"),
    usernames = {},
    io;

exports.io = function(server) {
  io = socketio.listen(server);

  // configure(); // for heroku, because it does not support web sockets
  io.sockets.on('connection', function (socket) {

    socket.on('sendchat', function (msg) {
      processNewChatMessage(socket.username, msg);
    });

    socket.on('joinchat', function (username) {
      joinChat(socket, username);
    });

    socket.on('disconnect', function() {
      disconnectUser(socket);
    });
  });
};

function configure() {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });
}

function processNewChatMessage(username, msg) {
  io.sockets.emit('updatechat', username, msg);
  insertMsgToDb(username, msg);
}

function joinChat(socket, username) {
  var msg = '';
  if (socket.username != undefined) {
    delete usernames[socket.username];
    msg = socket.username + ' changed name to ' +  username;
  } else {
    msg = username + ' connected';
  }
  socket.emit('updatechat', 'SERVER', msg);
  insertMsgToDb('SYSTEM', msg);

  socket.username = username;
  usernames[username] = username;
  io.sockets.emit('updateusers', usernames);
}

function disconnectUser(socket) {
  delete usernames[socket.username];
  io.sockets.emit('updateusers', usernames);
  insertMsgToDb('SYSTEM', socket.username + ' left');
  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
}

function insertMsgToDb(user, msg) {
  db.messages.save({username: user, msg: msg, date: Date.now()});
}