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
    console.log('Connected');

    socket.on('sendchat', function (data) {
      io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('joinchat', function (username) {
      console.log('Joining chat: ' + socket.username);
      if (socket.username != undefined) {
        delete usernames[socket.username];
        socket.emit('updatechat', 'SERVER', socket.username + ' changed name to ' +  username);
      } else {
        socket.emit('updatechat', 'SERVER', username + ' connected');
      }
      socket.username = username;
      usernames[username] = username;
      io.sockets.emit('updateusers', usernames);
    });

    socket.on('disconnect', function() {
      delete usernames[socket.username];
      io.sockets.emit('updateusers', usernames);
      socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
    });
  });
};