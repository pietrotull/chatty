exports.asTime = function(timestamp) {
  var date = new Date(timestamp);
  return date.getHours() + ':' + date.getMinutes();  
}

exports.asDate = function(timestamp) {
  var date = new Date(timestamp);
  return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();  
}