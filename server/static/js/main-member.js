var socket = io.connect('https://' + document.domain + ':' + location.port);
socket.on('connect', function() {
  var unimportant = setInterval(() => {
    getSongs(idGlob)
  }, 2000);
  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  idGlob = id;

  socket.emit('member_connect', {partyid: id});

  var name_request = {
    "partyid": id,
    "rtype": "getPartyName",
    "data": ""
  }
  sendMessage(JSON.stringify(name_request));
});
socket.on('message', function(msg) {
  console.log(msg)
  if (msg !== null && msg !== 'null') {
    if (msg.rtype == "searchResult") {
      setSearch(msg);
    }
    console.log("Received: " + msg);
    var obj = JSON.parse(msg);
    if (obj.rtype == "searchResult") {
      console.log("Setting search")
      setSearch(obj);
    } else if (obj.rtype == "songList") {
      console.log("SETTING SONGS")
      setSongs(obj);
    } else if (obj.rtype == "redirectShutdown") {
      window.location = "/party-shutdown.html";
    } else if (obj.rtype == "setPartyName") {
      setPartyName(obj);
    }
  }
});
