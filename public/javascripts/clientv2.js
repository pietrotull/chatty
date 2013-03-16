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
    $('div#' + topicId + ' div.topicComments').slideDown(100);
  });
}