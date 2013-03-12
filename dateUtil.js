exports.asTime = function(timestamp) {
  var date = new Date(timestamp);
  return pad(date.getHours()) + ':' + pad(date.getMinutes());  
}

exports.asDate = function(timestamp) {
  var date = new Date(timestamp);
  return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();  
}

function pad(number) {
  return (1e15+number+"").slice(-2);
}