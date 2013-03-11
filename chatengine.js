var socketio = require('socket.io'),
    db = require("./database.js"),
    dateUtil = require("./dateUtil.js"),
    usernames = {},
    rootTopic = 'root',
    io;

exports.io = function(server) {
  io = socketio.listen(server);

  // configure(); // for heroku, because it does not support web sockets
  io.sockets.on('connection', function (socket) {

    socket.on('addnewtopic', function (topic) {
      addNewTopic(topic);
    });

    socket.on('jointopic', function (topic, username) {
      joinTopic(socket, topic, username);
    });

    socket.on('sendmsg', function (msg) {
      console.log('socket::sendmsg', socket.topic);
      processNewChatMessage(socket.username, socket.topic, msg);
    });

    socket.on('disconnect', function() {
      console.log('socket::disconnect');
      disconnectUser(socket);
    });
  });
};

function addNewTopic(topic) {
  insertNewTopicToDb(topic);
  topic.asTime = dateUtil.asTime(topic.date);
  topic.asDate = dateUtil.asDate(topic.date);
  io.sockets.emit('addnewtopic', topic);
}

function configure() {
  io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
  });
}

function joinTopic(socket, topic, username) {
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
  socket.emit('updatechat', 'SERVER', msg + '(' + currentTopic + ')');
  socket.username = username;
  usernames[username] = username;
  io.sockets.emit('updateusers', usernames);
  socket.broadcast.to(currentTopic).emit('updatechat', 'SERVER', msg);
  
  if (isRoot(currentTopic)) {

  }

  /*
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER', 'you have connected to room1');
    // echo to room 1 that a person has connected to their room
    socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
    socket.emit('updaterooms', rooms, 'room1');
  */
}

function processNewChatMessage(username, topic, msgContent) {

  var timestamp = Date.now();
  var msg = { username: username, content: msgContent, date: timestamp, asTime: dateUtil.asTime(timestamp) };
  insertMsgToDb(username, topic, msg);
  io.sockets.in(topic).emit('updatetopic', msg);
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
  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
}

function insertMsgToDb(user, topicId, msg) {
  console.log(msg);
  db.messages.save({username: user, topicId: db.ObjectId(topicId), content: msg.content, date: msg.date });
}

function insertNewTopicToDb(topic) {
  topic.date = Date.now();
  db.topics.save(topic);
}