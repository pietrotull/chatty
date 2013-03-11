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
      processNewChatMessage(socket.username, socket.topic, msg);
    });

    socket.on('disconnect', function() {
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
  
  if (!isRoot(currentTopic)) {
    broadcastServerMsg(socket, currentTopic, username + ' has connected to this topic');
  }

  if (usernames[currentTopic] == null) {
    usernames[currentTopic] = {};
  }
  socket.username = username;
  usernames[currentTopic][username] = username;
  io.sockets.emit('updateusers', usernames);
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
  if (socket.topic !== undefined) {
    delete usernames[socket.topic][socket.username];
  }
  io.sockets.emit('updateusers', usernames);
  broadcastServerMsg(socket, socket.topic, socket.username + ' has left the building');
}

function broadcastServerMsg(socket, currentTopic, usermsg) {
  socket.broadcast.to(currentTopic).emit('updatetopic', {
    username: 'SERVER', 
    content: usermsg, 
    asTime: dateUtil.asTime(Date.now())
  });
}

function insertMsgToDb(user, topicId, msg) {
  db.messages.save({username: user, topicId: db.ObjectId(topicId), content: msg.content, date: msg.date });
}

function insertNewTopicToDb(topic) {
  topic.date = Date.now();
  db.topics.save(topic);
}