// let resultsDiv = document.getElementById("results");
function sendtextElement() { //Obselete
  let text_message = document.getElementById("test-text");
  sendMessage(text_message.value)
}
function sendMessage(msg) {
  console.log("Sending: " + msg);
  socket.send(msg);
}

var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
    });
    socket.on('message', function(msg) {
        console.log("Received: " + msg);
    });
