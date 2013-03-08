var socketio = require('socket.io'),
    db = require("./database.js"),
    usernames = {},
    rootTopic = 'root',
    io;

exports.io = function(server) {
  io = socketio.listen(server);

  // configure(); // for heroku, because it does not support web sockets
  io.sockets.on('connection', function (socket) {

    socket.on('addnewtopic', function (topic) {
      console.log('socket::addNewTopic', topic);
      addNewTopic(topic);
    });

    socket.on('jointopic', function (topic, username) {
      console.log('socket::jointopic', topic);
      jointopic(socket, topic, username);
    });

    socket.on('sendmsg', function (msg) {
      console.log('socket::sendmsg', topic);
      processNewChatMessage(socket.username, msg);
    });

    socket.on('disconnect', function() {
      console.log('socket::disconnect');
      disconnectUser(socket);
    });
  });
};

function addNewTopic(topic) {
  insertNewTopicToDb(topic);
  topic.asTime = asTime(topic.date);
  topic.asDate = asDate(topic.date);
  io.sockets.emit('addnewtopic', topic);
}

function configure() {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });
}

function jointopic(socket, topic, username) {
  var currentTopic = validateTopic(topic);
  socket.topic = currentTopic;
  socket.join(currentTopic);
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

  if (isRoot(currentTopic)) {

  }

  /*
    // store the username in the socket session for this client
    socket.username = username;
    // store the room name in the socket session for this client
    socket.room = 'room1';
    // add the client's username to the global list
    usernames[username] = username;
    // send client to room 1
    socket.join('room1');
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER', 'you have connected to room1');
    // echo to room 1 that a person has connected to their room
    socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
    socket.emit('updaterooms', rooms, 'room1');
  */
}

function processNewChatMessage(username, msg) {
  io.sockets.emit('updatechat', username, msg);
  insertMsgToDb(username, msg);
}

function validateTopic(topic)  {
  // TODO: check that topicsList contains given topic
  return topic ? topic : rootTopic;
}

function isRoot(topic) {
  return topic == rootTopic;
}

function disconnectUser(socket) {
  delete usernames[socket.username];
  io.sockets.emit('updateusers', usernames);
  insertMsgToDb('SYSTEM', socket.username + ' left');
  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
}

function insertMsgToDb(user, msg) {
  console.log('Save msg by: ' + user, msg);
  // db.messages.save({username: user, msg: msg, date: Date.now()});
}

function insertNewTopicToDb(topic) {
  topic.date = Date.now();
  db.topics.save(topic);
}

function asTime(timestamp) {
  var date = new Date(timestamp);
  return date.getHours() + ':' + date.getMinutes();  
}

function asDate(timestamp) {
  var date = new Date(timestamp);
  return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();  
}