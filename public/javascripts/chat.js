$(function(){
  var socket = connectSocket();
  bindSocketActions(socket);
  bindUserNameActions();
  bindSendMessage(socket);
  bindSendMessageWithEnter();
  // checkNotificationSupport();
  bindCheckNotificationPermissions();
  focusOnMsgField();
  setSendChatButton();
});
var username = '';

function bindUserNameActions() {
  $('input#saveName').click( function()  {
    console.log('saveName');
    username = $('input#name').val();
    $('span#username').html(username);
    setSendChatButton();
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
  if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
  } else {
    window.webkitNotifications.requestPermission();
  }  
}

function connectSocket() {
  return io.connect(window.location.hostname);
}

function bindSocketActions(socket) {
  socket.on('connect', function() {
    var username = 'Piet';
    socket.emit('joinchat', username); //prompt('What is your name?')
  });

  socket.on('updatechat', function (username, msg) {
    $('#conversation').append('<b>'+username + ':</b> ' + msg + '<br>');
    displayNotificationInUnfocused(username, msg);
  });

  socket.on('updateusers', function(data) {
    $('#users').empty();
    $.each(data, function(key, value) {
      $('#users').append('<div>' + key + '</div>');
    });
    
  });
}

function displayNotificationInUnfocused(title, msg) {
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

function checkNotificationSupport() {
  if (window.webkitNotifications) {
    console.log("Notifications are supported!");
  } else {
    console.log("Notifications are not supported for this Browser/OS version yet.");
  }
}

function focusOnMsgField() {
  $('#msg').focus();
}