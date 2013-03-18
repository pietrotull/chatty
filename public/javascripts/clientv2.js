$(function(){
  connectSocket();
  hideTopicCommentDivs();
  bindOpenTopicLinks();
  /*
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
  */
});
var socket;

function connectSocket() {
  socket = io.connect(window.location.hostname);
}

function hideTopicCommentDivs() {
  $('.topicComments').hide();
}

function bindOpenTopicLinks() {
  $('div.topic').click(function(event) {
    var topicId = $(event.target).closest('div.topicWrapper').attr('id');
    $('.topicComments').slideUp(100);
    var commentDiv = $('div#' + topicId + ' div.topicComments');
    populateMessagesToTopic(topicId, commentDiv);
    commentDiv.slideDown(100);
  });
}

function populateMessagesToTopic(topicId, commentDiv, callback) {
  $.getJSON('/messages/' + topicId, function(messages) {
    console.log('json: ', messages);
    commentDiv.empty();
    $.each( messages, function( key, value ) {
      // alert( key + ": " + value );
      var html = getMsgHtml(value);
      commentDiv.append(html);
      html.slideDown(100);
    });
  });
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
  var now = new Date(),
    time = pad(now.getHours()) + ':' + pad(now.getMinutes())  ;
  $('#clock').html(time);
  setInterval(setNameRowClock, 60 * 1000);
}

function pad(number) {
  return (1e15+number+"").slice(-2);
}