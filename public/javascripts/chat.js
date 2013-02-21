$(function(){
  $('#datasend').click( function() {

    var message = $('#data').val();
    $('#data').val('');
    socket.emit('sendchat', message);
  });

  // when the client hits ENTER on their keyboard
  $('#data').keypress(function(e) {
    if(e.which == 13) {
      $(this).blur();
      $('#datasend').focus().click();
    }
  });
});

var socket = io.connect(window.location.hostname);

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

if (window.webkitNotifications) {
  console.log("Notifications are supported!");
}
else {
  console.log("Notifications are not supported for this Browser/OS version yet.");
}