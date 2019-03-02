let resultsDiv = document.getElementById("results");
function foo() {
  let text_message = document.getElementById("test-text");
  sendMessage(text_message.value);
}

let ws = new WebSocket("ws://" + location.host.split(":")[0] + ":30001"); // Connect to page provider websocket
alert("ws://" + location.host.split(":")[0] + ":30001");
function sendMessage(input) {
  if (ws.readyState = "OPEN") {
    ws.send(input); //TODO: Use JSON.stringify
  }
}
ws.onmessage = function(event) {
  resultsDiv.innerHTML = event.data //TODO: Use JSON.parse
};
