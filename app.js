
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'), 
    user = require('./routes/user'), 
    http = require('http'), 
    path = require('path'),
    socketio = require('socket.io');

var app = express(),
    server,
    io,
    usernames = {};

app.configure(function (){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function (){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io = socketio.listen(server);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {
  console.log('Connection event!');
  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function (username) {
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