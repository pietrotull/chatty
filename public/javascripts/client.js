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
  bindTopicLinks();
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
    // displayNotificationIfUnfocused(username, msg);
  });

  socket.on('addnewtopic', function(topic) {
    addNewTopicTemplate(topic);
  });

  /*
  socket.on('updateusers', function(data) {
    $('#users').empty();
    $.each(data, function(key, value) {
      $('#users').append('<div>' + key + '</div>');
    }); 
  });
  */
}

function joinTopic() {
  setSendChatButton();
  topic = $('span.hidden').attr('id'); // what if we go to topic view?
  socket.emit('jointopic', topic, username); //prompt('What is your name?')
  console.log('Joining Topic: ', topic);
  $('span#username').html(username);
}

function checkForExistingUsername() {
  username = localStorage['username'];
  if (isValidUsername(username)) {
    $('input#name').val(username);
    joinTopic();
  }
  // setSendChatButton();
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
    $('input#topic').val('');
    $('textarea#description').val('');
  });
}

function bindTopicLinks() {
  $('div.topic').click(function(element) {
    console.log('clicked: ', element.target.id);
    window.location = '/topic/' + element.target.id;
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
  console.log('msg: ' +  msg.content);
  var msgHtml = $(
  '<div class="msg baseDiv hidden">' + 
  ' <div class="profile"> [' + msg.asTime + '] ' + msg.username + ':</div> ' + msg.content + 
  '</div>');
  $('#conversation').append(msgHtml);
  msgHtml.slideDown(200);
  // $('#conversation').append('<div class="msg baseDiv"><div class="profile">'+username + ':</div> ' + msg + '</div>');
};