let resultsDiv = document.getElementById("results");
function foo() {
  let text_message = document.getElementById("test-text");
  console.log("Sending: " + text_message.value);
  socket.send(text_message.value);
}

var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
    });
    socket.on('message', function(msg) {
        console.log("Received: " + msg);
    });
