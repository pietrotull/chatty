var socketio = require('socket.io'),
    db = require("./database.js"),
    usernames = {},
    io;

exports.io = function(server) {
  io = socketio.listen(server);

  // configure();
  io.sockets.on('connection', function (socket) {

    socket.on('sendchat', function (msg) {
      io.sockets.emit('updatechat', socket.username, msg);
      db.messages.save({username: socket.username, msg: msg});
    });

    socket.on('joinchat', function (username) {
      joinChat(socket, username);
      db.messages.save({username: 'SYSTEM', msg: username + ' joined'});
    });

    socket.on('disconnect', function() {
      db.messages.save({username: 'SYSTEM', msg: socket.username + ' left'});
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

function joinChat(socket, username) {
  if (socket.username != undefined) {
    delete usernames[socket.username];
    socket.emit('updatechat', 'SERVER', socket.username + ' changed name to ' +  username);
  } else {
    socket.emit('updatechat', 'SERVER', username + ' connected');
  }
  socket.username = username;
  usernames[username] = username;
  io.sockets.emit('updateusers', usernames);
}

function disconnectUser(socket) {
  delete usernames[socket.username];
  io.sockets.emit('updateusers', usernames);
  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
}