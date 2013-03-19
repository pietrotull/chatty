$(function(){
  connectSocket();
  hideTopicCommentDivs();
  bindOpenTopicLinks();
  bindSocketActions();
  setNameRowClock();
  bindSendMessage();
  /*
  checkForExistingUsername();
  bindUserNameActions();
  bindSendMessage(socket);
  bindCheckNotificationPermissions();
  focusOnMsgField();
  setSendChatButton();
  bindEnterSubmitForInputFields();
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
  socket.on('addnewtopic', function(topic) {
    addNewTopic(topic);
  });
;}

function updateTopic(msg) {
  var commentDiv = $('div#' + currentTopicId + ' div.topicComments');
  addMsgToTopic(commentDiv, msg);
}

function hideTopicCommentDivs() {
  $('.topicComments, .topicWrapper .highlightRow').hide();
}

function bindOpenTopicLinks(newTopic) {
  var selector = newTopic ? newTopic : 'div.topic';
  $(selector).click(function(event) {
    var topicId = $(event.target).closest('div.topicWrapper').attr('id');
    currentTopicId = topicId;
    $('.topicComments').slideUp(100);
    var commentDiv = $('div#' + topicId + ' div.topicComments');
    $('.highlightRow').hide();
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
    commentDiv.empty();
    $.each(messages, function(key, msg) {
      addMsgToTopic(commentDiv, msg);
    });
  });
}

function addMsgToTopic(commentDiv, comment) {
  var html = getMsgHtml(comment);
  commentDiv.append(html);
  html.slideDown(100);
}

function getMsgHtml(msg) {
  return $(
    '<div class="msg baseDiv hidden">' + 
    ' <div class="profile"> [' + getPaddedTime(msg.date) + '] ' + msg.author + '</div>' + msg.comment + 
    '</div>');
};

function getPaddedTime(timestamp) {
  var now = new Date(timestamp);
  return pad(now.getHours()) + ':' + pad(now.getMinutes());
}

function setNameRowClock() {
  $('[name="clock"]').html(getPaddedTime(Date.now()));
  setInterval(setNameRowClock, 60 * 1000);
}

function pad(number) {
  return (1e15+number+"").slice(-2);
}

function bindSendMessage() {
  $('input[type="button"]').click(function(event) {
    var inputFields = $(event.target).siblings('input[type="text"], input[type="hidden"], textarea');
    var msg = {};
    $.each(inputFields, function(key, inputField) {
      var field = $(inputField);
      msg[field.attr('name')] = field.val();
    });
    var action = $(event.target).parent('form').attr('name');
    if (validateInputs(msg)) {
      console.log('sending out: ', msg);
      socket.emit(action, msg);
    }
  });
}

function validateInputs(object) {
  var isValid = false;
  $.each(object, function(key, field) {
    if(field == null || field == '' || field == undefined) {
      isValid = false;
      return false;
    } 
    isValid = true;
  });
  return isValid;
}

function addNewTopic(topic) {
  var newTopic = $('#topicTemplate').clone();
  newTopic.attr('id', topic._id);

  // TODO: generic function to set data
  newTopic.find('span[name="author"]').html(topic.author);
  newTopic.find('span[name="title"]').html(topic.title);
  newTopic.find('span[name="description"]').html(topic.description);
  newTopic.find('span[name="asTime"]').html(topic.asTime);
  newTopic.find('span[name="asDate"]').html(topic.asDate);

  $('#topics').append(newTopic);
  newTopic.slideDown();
  bindOpenTopicLinks(newTopic);
}
