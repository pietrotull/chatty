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

    socket.on('addnewmsg', function (msg) {
      processNewChatMessage(socket, msg);
    });

    socket.on('sendmsg', function (msg) {
      processNewChatMessage(socket, msg);
    });

    socket.on('setname', function(username) {
      console.log('setting name to: ', username);
      setUsername(socket, username.username);
    });

    socket.on('disconnect', function() {
      disconnectUser(socket);
    });
  });
};

function setUsername(socket, username) {
  var topic = socket.topic;
  if (socket.username && username != socket.username) {
    delete usernames[topic][socket.username];
  }
  socket.username = username;
  usernames[topic][username] = username;
  io.sockets.emit('updateusers', usernames);
}

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

function joinTopic(socket, topic) {
  var currentTopic = validateTopic(topic);
  if (socket.topic === currentTopic)
    return;

  if (socket.topic) {
    socket.leave(socket.topic);
  }
  socket.topic = currentTopic;
  socket.join(currentTopic);

  // Create username for topic if none exists
  if (!usernames[topic]) {
    usernames[topic] = {};
  }
  io.sockets.emit('updateusers', usernames);
}

function processNewChatMessage(socket, comment) {
  var timestamp = Date.now();
  comment['date'] = timestamp;
  db.saveComment(comment);
  comment['asTime'] = dateUtil.asTime(timestamp);
  io.sockets.in(socket.topic).emit('updatetopic', comment);
}

function validateTopic(topic)  {
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

function insertNewTopicToDb(topic) {
  topic.date = Date.now();
  db.topics.save(topic);
}