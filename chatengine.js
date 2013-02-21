var socketio = require('socket.io');

function configure(io) {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });
}

exports.io = function(server) {
  var io = socketio.listen(server),
      usernames = {};
  configure(io);

  io.sockets.on('connection', function (socket) {
    socket.on('sendchat', function (data) {
      io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('joinchat', function (username) {
      socket.username = username;
      usernames[username] = username;
      socket.emit('updatechat', 'SERVER', username + ' connected');
      io.sockets.emit('updateusers', usernames);
    });

    socket.on('disconnect', function() {
      delete usernames[socket.username];
      io.sockets.emit('updateusers', usernames);
      socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
    });
  });
};