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
      processNewChatMessage(socket, msg);
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

  if (socket.username && username != socket.username) {
    console.log('Changing name from ' + socket.username + ' to ' + username);
    delete usernames[currentTopic][socket.username];
  }

  if (!isRoot(currentTopic)) {
    broadcastServerMsg(socket, currentTopic, username + ' has connected to this topic');
  }

  handleUserName(socket, username); 
}

function handleUserName(socket, username) {
  var topic = socket.topic;
  if (socket.username && username != socket.username) {
    console.log('Changing name from ' + socket.username + ' to ' + username);
    delete usernames[topic][socket.username];
  }
  
  if (!usernames[topic]) {
    usernames[topic] = {};
  }
  socket.username = username;
  usernames[topic][username] = username;
  io.sockets.emit('updateusers', usernames);
}

function processNewChatMessage(socket, msgContent) {
  var timestamp = Date.now(),
  msg = { 
    topicId: socket.topic,
    username: socket.username, 
    content: msgContent, 
    date: timestamp, 
    asTime: dateUtil.asTime(timestamp) 
  };
  db.saveMsg(msg);
  io.sockets.in(socket.topic).emit('updatetopic', msg);
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

function insertNewTopicToDb(topic) {
  topic.date = Date.now();
  db.topics.save(topic);
}