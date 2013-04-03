$(function(){
  connectSocket();
  hideTopicCommentDivs();
  bindOpenTopicLinks();
  bindSocketActions();
  setNameRowClock();
  bindSendMessage();
  bindEnterSubmitForInputFields();
  checkForExistingUsername();
  bindUserNameActions();
});
var socket, 
  currentTopicId = 'root';

function connectSocket() {
  socket = io.connect(window.location.hostname);
  joinTopic(currentTopicId);
}

function bindSocketActions() {
  socket.on('updatetopic', function (msg) {
    updateTopic(msg);
    // displayNotificationIfUnfocused(msg.username, msg.content);
  });
  socket.on('addnewtopic', function(topic) {
    addNewTopic(topic);
    console.log('Updating topic');
  });
  socket.on('updateusers', function(usernames) {
    updateUsers(usernames);
  });
}

function updateUsers(usernames) {
  /*
  $.each(usernames, function(key, name) {
    console.log('key: ' + key + ' names: ', name);
  });
  */
  console.log(usernames[currentTopicId]);
}

function updateTopic(comment) {
  var commentDiv = $('div#' + currentTopicId + ' div.topicComments');
  addMsgToTopic(commentDiv, comment).slideDown(100);
}

function hideTopicCommentDivs() {
  $('.topicComments, div[name="newMsgRow"]').hide();
}

function bindOpenTopicLinks() {
  var topics = $('div.topic');
  topics.unbind('click');
  topics.click(function(event) {
    var topicId = $(event.target).closest('div.topicWrapper').attr('id');
    if (!(currentTopicId == topicId)) {
      currentTopicId = topicId;
      $('.topicComments, div[name="newMsgRow"]').hide();
      var commentDiv = $('div#' + topicId + ' div.topicComments');
      populateMessagesToTopic(topicId, commentDiv);
      commentDiv.show();
      joinTopic(topicId);
      commentDiv.siblings('div[name="newMsgRow"]').show();
    }
  });
}

function joinTopic(topicId) {
  socket.emit('jointopic', topicId, localStorage['username']);
}

function populateMessagesToTopic(topicId, commentDiv, callback) {
  $.getJSON('/messages/' + topicId, function(messages) {
    commentDiv.empty();
    $.each(messages, function(key, msg) {
      addMsgToTopic(commentDiv, msg).removeClass('hidden');
    });
    commentDiv.slideDown();
  });
}

function addMsgToTopic(commentDiv, comment) {
  var html = getMsgHtml(comment);
  commentDiv.append(html);
  return html;
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
  var selector = 'input[type="button"]';
  $(selector).unbind('click');
  $(selector).click(function(event) {
    var inputFields = $(event.target).siblings('input[type="text"], input[type="hidden"], textarea');
    var msg = {};
    $.each(inputFields, function(key, inputField) {
      var field = $(inputField);
      msg[field.attr('name')] = field.val();
    });
    var action = $(event.target).parent('div.form').attr('name');
    if (validateInputs(msg)) {
      console.log('sending out: ' + action, msg);
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
  newTopic.find('input[name="topicId"]').val(topic._id);

  // TODO: generic function to set data
  newTopic.find('span[name="author"]').html(topic.author);
  newTopic.find('span[name="title"]').html(topic.title);
  newTopic.find('span[name="description"]').html(topic.description);
  newTopic.find('span[name="asTime"]').html(topic.asTime);
  newTopic.find('span[name="asDate"]').html(topic.asDate);

  $('#topics').append(newTopic);
  newTopic.slideDown();
  bindOpenTopicLinks();
  bindSendMessage();
  bindEnterSubmitForInputFields();
}

function bindEnterSubmitForInputFields() {
  var inputFieldsSelector = $('input, textarea');
  inputFieldsSelector.unbind('keypress');
  inputFieldsSelector.keypress(function(e) {
    if(e.which == 13) {  // Enter -button
      var sisterSubmit = $(this).siblings('[type="button"]');
      $(this).blur();
      sisterSubmit.focus().click();     
    }
  });
}

function checkForExistingUsername() {
  var user = localStorage['username'];
  if (user) {
    $('input#name').val(user);
    $('span#name').html(user);
  }
}

function bindUserNameActions() {
  $('input#saveName').click(function() {
    username = $('input#name').val();
    if (username) {
      localStorage['username'] = username;
      checkForExistingUsername();
    }
  });
}