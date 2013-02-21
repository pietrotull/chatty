$(function(){
  var socket = connectSocket();
  bindSocketActions(socket);
  bindSendMessage();
  bindSendMessageWithEnter();
  // checkNotificationSupport();
  checkNotificationPermissions();
  focusOnMsgField();
});

function bindSendMessage() {
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

function checkNotificationPermissions() {
  console.log('checking permissions');
  if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
    // function defined in step 2
    window.webkitNotifications.createNotification(
        'icon.png', 'Notification Title', 'Notification content...');
  } else {
    window.webkitNotifications.requestPermission();
  }  
}

function connectSocket() {
  return io.connect(window.location.hostname);
}

function bindSocketActions(socket) {
  socket.on('connect', function() {
    socket.emit('joinchat', prompt('What is your name?'));
  });

  socket.on('updatechat', function (username, msg) {
    $('#conversation').append('<b>'+username + ':</b> ' + msg + '<br>'); 
  });

  socket.on('updateusers', function(data) {
    $('#users').empty();
    $.each(data, function(key, value) {
      $('#users').append('<div>' + key + '</div>');
    });
  });
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