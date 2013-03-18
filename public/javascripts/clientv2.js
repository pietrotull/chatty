$(function(){
  connectSocket();
  hideTopicCommentDivs();
  bindOpenTopicLinks();
  bindSocketActions();
  /*
  checkForExistingUsername();
  bindUserNameActions();
  bindSendMessage(socket);
  bindCheckNotificationPermissions();
  focusOnMsgField();
  setSendChatButton();
  bindAddNewTopic();
  bindEnterSubmitForInputFields();
  setNameRowClock(); // update once a minute
  */
});
var socket, 
  currentTopicId = 'root';

function connectSocket() {
  socket = io.connect(window.location.hostname);
}

function bindSocketActions() {
  socket.on('updatetopic', function (msg) {
    updateTopic(msg);
    // displayNotificationIfUnfocused(msg.username, msg.content);
  });
}

function updateTopic(msg) {
  // console.log('add msg', msg);
  var commentDiv = $('div#' + currentTopicId + ' div.topicComments');
  addMsgToTopic(commentDiv, msg);
}

function hideTopicCommentDivs() {
  $('.topicComments').hide();
  $('.topicWrapper .highlightRow').hide();
}

function bindOpenTopicLinks() {
  $('div.topic').click(function(event) {
    var topicId = $(event.target).closest('div.topicWrapper').attr('id');
    currentTopicId = topicId;
    $('.topicComments').slideUp(100);
    var commentDiv = $('div#' + topicId + ' div.topicComments');
    populateMessagesToTopic(topicId, commentDiv);
    commentDiv.slideDown(100);
    joinTopic(topicId);
    commentDiv.siblings('.highlightRow').show();
  });
}

function joinTopic(topicId) {
  socket.emit('jointopic', topicId, 'TempUserName');
}

function populateMessagesToTopic(topicId, commentDiv, callback) {
  $.getJSON('/messages/' + topicId, function(messages) {
    console.log('json: ', messages);
    commentDiv.empty();
    $.each( messages, function( key, msg ) {
      addMsgToTopic(commentDiv, msg);
    });
  });
}

function addMsgToTopic(commentDiv, msg) {
  var html = getMsgHtml(msg);
  commentDiv.append(html);
  html.slideDown(100);
}

function getMsgHtml(msg) {
  return $(
    '<div class="msg baseDiv hidden">' + 
    ' <div class="profile"> [' + getPaddedTime(msg.date) + '] ' + msg.username + '</div>' + msg.content + 
    '</div>');
};

function getPaddedTime(timestamp) {
  var now = new Date(timestamp);
  return pad(now.getHours()) + ':' + pad(now.getMinutes());
}

function setNameRowClock() {
  $('#clock').html(getPaddedTime(Date.now()));
  setInterval(setNameRowClock, 60 * 1000);
}

function pad(number) {
  return (1e15+number+"").slice(-2);
}