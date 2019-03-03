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
  var obj = JSON.parse(msg);
  if (obj.rtype == "songList"){
    setSongs(obj);
  } else if (obj.rtype == "auth") {
    window.location = obj.data;
  }
});
function upvote(e){
  if (e.css("color") == "rgb(0, 255, 0)"){
    e.css("color","#000000");
    var obj = {
      partyid : $("#parties").find(".active").attr("id"),
      rtype : "sendVote",
      data : {
        songid : e.parent().parent().attr("id"),
        vote : -1.
      }
    }
    var json = JSON.stringify(obj);
    if (e.attr("id")){
      sendMessage(json);
    }
    var json = JSON.stringify(obj);
  } else {
    e.css("color","#00ff00");
    var obj = {
      partyid : $("#parties").find(".active").attr("id"),
      rtype : "sendVote",

      data : {
        songid : e.parent().parent().attr("id"),
        vote : 1 + (e.next().css("color") == "rgb(255, 0, 0)")

      }
    }
    var json = JSON.stringify(obj);
  }
  sendMessage(json);
  e.next().css("color","#000000");
}
function downvote(e){
  if (e.css("color") == "rgb(255, 0, 0)"){
    e.css("color","#000000");
    var obj = {
      partyid : $("#parties").find(".active").attr("id"),
      rtype : "sendVote",
      data : {
        songid : e.parent().parent().attr("id"),
        vote : 1
      }
    }
    var json = JSON.stringify(obj);

  } else {
    e.css("color","#ff0000");
    var obj = {
      partyid : $("#parties").find(".active").attr("id"),
      rtype : "sendVote",
      data : {
        songid : e.parent().parent().attr("id"),
        vote : -1 - (e.prev().css("color") == "rgb(0, 255, 0)")
      }
    }
    var json = JSON.stringify(obj);
  }
  sendMessage(json);
  e.prev().css("color", "#000000");
}
function start(){
  var url_string = window.location.href
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  if (id != undefined) {
    idAttribute = $("#parties").find(".active").attr("id", id);
    document.cookie = id;
    authRequest = {
      "partyid":id,
      "rtype":"auth",
      "data":""
    }
    strAuthRequest = JSON.stringify(authRequest);
    sendMessage(strAuthRequest);
  } else {
    $("#parties").find(".active").attr("id", document.cookie);
  }
  var unimportant = setInterval(() => {getSongs($("#parties").find(".active"))}, 2000);
}
function getSongs(e){
  var obj = {
    partyid : e.attr("id"),
    rtype : "getSongs"
  }
  var json = JSON.stringify(obj);
  if (e.attr("id")){
    sendMessage(json);
  }
}
function setParty(e){
  $(".active").removeClass("active");
  e.addClass("active");
}
function setSongs(e){
  for (i in e.data){
    var html_out = `<li class='list-group-item' id='${i.uri}'>
    ${i.name} - ${i.artists} (${i.album})
    <i class="material-icons float-right">
    <span class="thup" onclick="upvote($(this))">
    thumb_up
    </span>
    <span class="thdn" onclick="downvote($(this))">
    thumb_down
    </span>
    </i>
    </li>`
    $("#tracks").append(html_out);
  }
}
