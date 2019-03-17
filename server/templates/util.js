var idGlob;

function sendMessage(msg) {
  console.log("Sending: " + msg);
  socket.send(msg);
}

var socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('connect', function() {
  socket.emit('my event', {data: 'I\'m connected!'});
});
socket.on('message', function(msg) {
  console.log(msg)
  if (msg !== null && msg !== 'null') {
    if (msg.rtype == "searchResult"){
      setSearch(msg);
    }
    console.log("Received: " + msg);
    var obj = JSON.parse(msg);
    if (obj.rtype == "searchResult"){
      console.log("Setting search")
      setSearch(obj);
    } else if (obj.rtype == "auth") {
      console.log("REDIRECTING TO AUTH URL")
      window.location = obj.data;
    }
  }
});
function startPlayback(e) {
  var obj = {
    partyid : idGlob,
    rtype : "startPlayback",
    data : ""
  }
  var json = JSON.stringify(obj);
  if (obj.partyid){
    sendMessage(json);
  }
}
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
    if (obj.partyid){
      sendMessage(json);
    }
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
    }
    else {
      e.css("color","#ff0000");
      var obj = {
        partyid : $("#parties").find(".active").attr("id"),
        rtype : "sendVote",
        data : {
          songid : e.parent().parent().attr("id"),
          vote : -1 - (e.prev().css("color") == "rgb(0, 255, 0)")
        }
      }
      if (obj.partyid){
        sendMessage(json);
      }
      e.prev().css("color", "#000000");
    }
  }
}
function start(){
  var url_string = window.location.href
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  if (id != undefined && id != null) {
    // idAttribute = ;
    document.cookie = "id="+id;
    authRequest = {
      "partyid":id,
      "rtype":"auth",
      "data":""
    }
    strAuthRequest = JSON.stringify(authRequest);
    sendMessage(strAuthRequest);
  } else {
    console.log("Setting ID");
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie)
    id = getCookie("id")
    idGlob = id
    $("#parties").find(".1").addClass("active");
    $("#parties").find(".1").attr("id", id);

    var authCode = url.searchParams.get("code");
    authTokenData = {
      "partyid":id,
      "rtype":"setAuthToken",
      "data": authCode
    }
    strAuthTokenData = JSON.stringify(authTokenData);
    sendMessage(strAuthTokenData);
  }
  var unimportant = setInterval(() => {getSongs(idGlob)}, 2000);
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getSongs(e){
  var obj = {
    partyid : e,
    rtype : "getSongs",
    data : ""
  }
  var json = JSON.stringify(obj);
  if (obj.getSongs){
    sendMessage(json);
  }
}
function setParty(e){
  $(".active").removeClass("active");
  e.addClass("active");
}
function setSongs(e){
  for (i in e.data.tracks){
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
function search(e){
  var obj = {
    partyid : idGlob,
    rtype : "getSearchResults",
    data : e
  }
  var json = JSON.stringify(obj);
  if (obj.partyid){
    sendMessage(json);
  }

}
function setSearch(e){
  var myNode = $("#results");
  console.log(myNode)
  console.log(myNode[0].children[0])
  while (myNode[0].children[0]) {
      console.log(myNode)
      myNode[0].removeChild(myNode[0].children[0]);
  }
  for (i = 0; i < e.data.tracks.length; i++) {
    console.log(e.data.tracks[i].name)
    var html_out = "<li class='list-group-item' id="+ e.data.tracks[i].uri + ">"
    + e.data.tracks[i].name + "- " + e.data.tracks[i].artists + " - " + e.data.tracks[i].album +
    "<button type=\"button\" class=\"btn btn-primary float-right\" onclick=\"addSong($(this).parent().attr('id'))\">Add</button>" +
    "</li>"
    $("#results").append(html_out);
  }

}
function addSong(e){
  console.log("Called add song")
  var obj = {
    partyid : idGlob,
    rtype : "addSong",
    data : e
  }
  var json = JSON.stringify(obj);
  if (obj.partyid){
    sendMessage(json);
  }
}
