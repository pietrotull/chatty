$(function(){
  connectSocket();
  checkForExistingUsername();
  bindSocketActions();
  bindUserNameActions();
  bindSendMessage(socket);
  bindCheckNotificationPermissions();
  focusOnMsgField();
  setSendChatButton();
  bindAddNewTopic();
  bindTopicLinks();
  bindEnterSubmitForInputFields();
  setNameRowClock(); // update once a minute
});

var username = '',
    topic = '',
    socket;

function connectSocket() {
  socket = io.connect(window.location.hostname);
}

function bindSocketActions() {
  socket.on('updatetopic', function (msg) {
    updateTopic(msg);
    displayNotificationIfUnfocused(msg.username, msg.content);
  });

  socket.on('addnewtopic', function(topic) {
    addNewTopicTemplate(topic);
  });

  socket.on('updateusers', function(users) {
    updateUsers(users);
  });
}

function joinTopic() {
  setSendChatButton();
  topic = $('span.hidden').attr('id'); // what if we go to topic view?
  socket.emit('jointopic', topic, username); //prompt('What is your name?')
  $('span#username').html(username);
}

function checkForExistingUsername() {
  username = localStorage['username'];
  if (isValidUsername(username)) {
    $('input#name').val(username);
    joinTopic();
  }
}

function bindUserNameActions() {
  $('input#saveName').click( function()  {
    username = $('input#name').val();
    localStorage['username'] = username;
    joinTopic();
  });
}

function setSendChatButton() {
  if(isValidUsername(username)) {
    $('input#msgsend').removeAttr('disabled');
  } else {
    $('input#msgsend').attr('disabled', 'disabled');
  }
}

function isValidUsername(username) {
  return username !== null && username !== undefined && username !== '';
}

function bindSendMessage(socket) {
  $('#msgsend').click( function() {
    var message = $('#msg').val();
    $('#msg').val('');
    socket.emit('sendmsg', message);
  });
}

function bindCheckNotificationPermissions() {
  $('#notification').click( function() {
    checkNotificationPermissions();
  });
}

function checkNotificationPermissions() {
  if (!window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    window.webkitNotifications.requestPermission();
  }  
}

function displayNotificationIfUnfocused(title, msg) {
  if (!document.hasFocus()) {
    createNewMessageNotification(title, msg);
  }
}

// hard coded notificition icon for moment
function createNewMessageNotification(title, content) {
  notification = window.webkitNotifications.createNotification(
        'http://upload.wikimedia.org/wikipedia/en/thumb/a/ac/Zorroandbernardo.jpg/250px-Zorroandbernardo.jpg', 
        title, 
        content);
  notification.show();
  setTimeout(function(){
    notification.cancel()
  }, 5000);
}

function focusOnMsgField() {
  $('#msg').focus();
}

function bindAddNewTopic() {
  $('input#submitNewTopic').click(function() {
    var topic = {};
    topic.title = $('input#topic').val();
    topic.description = $('textarea#description').val();
    topic.name = $('input#name').val();
    socket.emit('addnewtopic', topic);
    $('input#topic').val('');
    $('textarea#description').val('');
  });
}

function addNewTopicTemplate(topic) {
  var topicHtml = 
  '<div id="' + topic._id + '" class="topic baseDiv hidden">' +
  ' <div class="topicAuthor">Created ' + topic.asDate + ' at ' + 
      topic.asTime + '<br/>' + 
  '   By ' + topic.name +   
  ' </div>' + 
  ' <b>' + topic.title + '</b><br/>' +
      topic.description + 
  '</div>';
  $('#topics').append(topicHtml);
  var selector = 'div#'+topic._id;
  $(selector).slideDown();
}

function updateTopic(msg) {
  var msgHtml = $(
  '<div class="msg baseDiv hidden">' + 
  ' <div class="profile"> [' + msg.asTime + '] ' + msg.username + '</div>' + msg.content + 
  '</div>');
  $('#conversation').append(msgHtml);
  msgHtml.slideDown(200);
};

function updateUsers(users) {
  var usersOnlineInThisTopic = users[topic]
  $('#users').empty();
  $.each(usersOnlineInThisTopic, function(key, value) {
    $('#users').append('<li>' + key + '</li>');
  });
}

function bindTopicLinks() {
  $('div.topic').click(function(element) {
    var topicId = element.target.id;
    if (topicId == null || topicId == '' || topicId == undefined) { // if clicks msg title
      var topicId = element.target.parentNode.id;
    }
    window.location = '/topic/' + topicId;
  });
}

// update once a minute the clock on new msg row
function setNameRowClock() {
  var now = new Date(),
    time = pad(now.getHours()) + ':' + pad(now.getMinutes());
  $('#clock').html(time);
  setInterval(setNameRowClock, 60 * 1000);
}

function bindEnterSubmitForInputFields() {
  $('input, textarea').keypress(function(e) {
    if(e.which == 13) {  // Enter -button
      var sisterSubmit = $(this).siblings('[type="button"]');
      $(this).blur();
      sisterSubmit.focus().click();
    }
  });
}

function pad(number) {
  return (1e15+number+"").slice(-2);
}