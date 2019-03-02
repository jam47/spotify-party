let SERVER = "amc40.host.cs.st-andrews.ac.uk:30001"
let resultsDiv = document.getElementById("results");
function foo() {
  let text_message = document.getElementById("test-text");
  sendMessage(text_message.value);
}

let ws = new WebSocket("ws://" + SERVER); // Connect to page provider websocket
function sendMessage(input) {
  if (ws.readyState = "OPEN") {
    ws.send(input); //TODO: Use JSON.stringify
  }
}
ws.onmessage = function(event) {
  resultsDiv.innerHTML = event.data //TODO: Use JSON.parse
};
