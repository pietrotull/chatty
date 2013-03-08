$(function(){
  connectSocket();
  checkForExistingUsername();
  bindSocketActions();
  bindUserNameActions();
  bindSendMessage(socket);
  bindSendMessageWithEnter();
  bindCheckNotificationPermissions();
  focusOnMsgField();
  setSendChatButton();
  bindAddNewTopic();
});


var username = '',
    topic = '',
    socket;

function connectSocket() {
  socket = io.connect(window.location.hostname);
}

function checkForExistingUsername() {
  username = localStorage['username'];
  if (isValidUsername(username)) {
    $('input#name').val(username);
    joinChat();
  }
  // setSendChatButton();
}

function joinChat() {
  setSendChatButton();
  socket.emit('join', topic, username); //prompt('What is your name?')
  $('span#username').html(username);
}

function bindUserNameActions() {
  $('input#saveName').click( function()  {
    username = $('input#name').val();
    localStorage['username'] = username;
    joinChat();
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
    socket.emit('sendchat', message);
  });
}

function bindSendMessageWithEnter() {
  $('#msg').keypress(function(e) {
    if(e.which == 13) {  // Enter -button
      $(this).blur();
      $('#msgsend').focus().click();
    }
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

function bindSocketActions() {
  socket.on('updatechat', function (username, msg) {
    $('#conversation').append('<div class="msg baseDiv"><div class="profile">'+username + ':</div> ' + msg + '</div>');
    displayNotificationIfUnfocused(username, msg);
  });

  socket.on('updateusers', function(data) {
    $('#users').empty();
    $.each(data, function(key, value) {
      $('#users').append('<div>' + key + '</div>');
    }); 
  });

  socket.on('addnewtopic', function(topic) {
    console.log('new topic', topic);
  });
}

function displayNotificationIfUnfocused(title, msg) {
  if (!document.hasFocus()) {
    createNewMessageNotification(title, msg);
  }
}

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
  $('button#submitNewTopic').click(function() {
    var topic = {};
    topic.title = $('input#topic').val();
    topic.description = $('textarea#description').val();
    topic.name = $('input#name').val();
    socket.emit('addnewtopic', topic);
  });
}