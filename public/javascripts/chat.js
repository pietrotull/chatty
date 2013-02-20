var socket = io.connect('http://192.168.1.39:3000');

socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});


socket.on('connect', function() {
  socket.emit('adduser', prompt('What is your name?'));
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