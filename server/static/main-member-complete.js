var idGlob;
var deviceInterval;
var upvoteVotedColor = "rgb(0, 255, 0)";
var downvoteVotedColor = "rgb(255, 0, 0)";


function sendMessage(msg) {
  console.log("Sending: " + msg);
  socket.send(msg);
}

function setPartyName(e) {
  //// TODO: set name in parties
  var idSpan = document.getElementById("party-id");
  idSpan.innerHTML = idGlob;
  var joinURL = document.getElementById("join-url");
  var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '')  + "/main-member.html?id=" + idGlob
  joinURL.innerHTML = url;
  var joinURLQR = document.getElementById("join-qr-code");
  new QRCode(joinURLQR, {
    text: url,
    width: 128,
    height: 128,
    colorDark : "#191414",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});
$("#join-qr-code > img").css({"border" : "20px solid white",
  "border-radius" : "4px"});
}

function copyID(){
  copyDivElementValue("party-id");
}

function copyDivElementValue(element_name) {
  if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(element_name));
        range.select();
        document.execCommand("copy");
        document.selection.empty();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(element_name));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
    }
}

function copyUrl() {
  copyDivElementValue("join-url");

}

function upvote(e) {
  if (e.css("color") == "rgb(0, 255, 0)") {
    e.css("color", "#000000");
    var obj = {
      partyid: idGlob,
      rtype: "sendVote",
      data: {
        uri: e.parent().parent().parent().attr("id"),
        voteMod: -1.
      }
    }
    var json = JSON.stringify(obj);
    console.log("REMOVING UPVOTE");
    if (obj.partyid) {
      sendMessage(json);
    }
  } else {
    setUpvoteVotedColor(e);
    var obj = {
      partyid: idGlob,
      rtype: "sendVote",

      data: {
        uri: e.parent().parent().parent().attr("id"),
        voteMod: 1 + (e.next().css("color") == "rgb(255, 0, 0)")

      }
    }
    var json = JSON.stringify(obj);
    console.log("SETTING UPVOTE");
    if (obj.partyid) {
      sendMessage(json);
    }
    e.next().css("color", "#000000");
  }
}

function downvote(e) {
  if (e.css("color") == "rgb(255, 0, 0)") {
    e.css("color", "#000000");
    var obj = {
      partyid: idGlob,
      rtype: "sendVote",
      data: {
        uri: e.parent().parent().parent().attr("id"),
        voteMod: 1
      }
    }
    var json = JSON.stringify(obj);
    console.log("REMOVING DOWNVOTE");
    if (obj.partyid) {
      sendMessage(json);
    }
  } else {
    setDownvoteVotedColor(e);
    var obj = {
      partyid: idGlob,
      rtype: "sendVote",
      data: {
        uri: e.parent().parent().parent().attr("id"),
        voteMod: -1 - (e.prev().css("color") == "rgb(0, 255, 0)")
      }
    }
    console.log("SETTING DOWNVOTE");
    var json = JSON.stringify(obj);
    if (obj.partyid) {
      sendMessage(json);
    }
    e.prev().css("color", "#000000");
  }
}

function setUpvoteVotedColor(upvote) {
  upvote.css("color", upvoteVotedColor);
}

function setDownvoteVotedColor(downvote) {
  downvote.css("color", downvoteVotedColor);
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
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

function getSongs(e) {
  var obj = {
    partyid: e,
    rtype: "getSongs",
    data: ""
  }
  var json = JSON.stringify(obj);
  console.log("GETTING SONGS STILL TO PLAY")

  sendMessage(json);

}

function setParty(e) {
  $(".active").removeClass("active");
  e.addClass("active");
}

function songLocationInData(data, uri) {
  data.forEach(function(songData, i) {
    if (songData.uri == uri) {
      return i;
    }
  })
  return -1;
}
//will return 0 if song not present
function previousSongUserVote(uri) {
  var myNode = $("#tracks");
  for (i in myNode[0].children) {
    if (myNode[0].children[i].id == uri) {
      var thumb_up = $(myNode[0].children[i].getElementsByClassName("thup")[0]);
      if (thumb_up.css("color") == upvoteVotedColor) {
        return 1;
      }
      var thumb_down = $(myNode[0].children[i].getElementsByClassName("thdn")[0]);
      if (thumb_down.css("color") == downvoteVotedColor) {
        return -1;
      }
      return 0;
    }
  }
  return 0;
}

function setSongs(e) {
  var myNode = $("#tracks");
  for (i in e.data) {
    e.data[i].userVote = previousSongUserVote(e.data[i].uri);
  }
  while (myNode[0].children[0]) {
    myNode[0].removeChild(myNode[0].children[0]);
  }
  for (i in e.data) {
    var html_out = "<li class='song_to_play_container list-group-item' id=" + e.data[i].uri + "><div class=\"song_to_play_details\">" +
      e.data[i].name + " - " + e.data[i].artists + " (" + e.data[i].album + ") </div>" +
      "<i class=\"material-icons float-right\">" +
      "<div class=\"song_to_play_up_down_vote\"><span class=\"thup\" onclick=\"upvote($(this))\">" +
      " thumb_up" +
      "</span>" +
      "<span class=\"thdn\" onclick=\"downvote($(this))\">" +
      " thumb_down" +
      "</span>" +
      "</i></div>" +
      "</li>"
    $("#tracks").append(html_out);
    if (e.data[i].userVote == 1) {
      setUpvoteVotedColor($($("#tracks")[0].lastChild.getElementsByClassName("thup")));
    } else if (e.data[i].userVote == -1) {
      setDownvoteVotedColor($($("#tracks")[0].lastChild.getElementsByClassName("thdn")));
    }
  }
}

function search(e) {
  var obj = {
    partyid: idGlob,
    rtype: "getSearchResults",
    data: e
  }
  var json = JSON.stringify(obj);
  if (obj.partyid) {
    sendMessage(json);
  }

}

function setSearch(e) {
  var myNode = $("#results");
  console.log(myNode)
  console.log(myNode[0].children[0])
  while (myNode[0].children[0]) {
    console.log(myNode)
    myNode[0].removeChild(myNode[0].children[0]);
  }
  for (i = 0; i < e.data.tracks.length; i++) {
    console.log(e.data.tracks[i].name)
    var html_out = "<li class='list-group-item' id=" + e.data.tracks[i].uri + ">" +
      e.data.tracks[i].name + "- " + e.data.tracks[i].artists + " - " + e.data.tracks[i].album +
      "<button type=\"button\" class=\"btn float-right sp_green_btn\" onclick=\"addSong($(this).parent().attr('id'))\">Add</button>" +
      "</li>"
    $("#results").append(html_out);
  }

}

function addSong(e) {
  console.log("Called add song")
  var obj = {
    partyid: idGlob,
    rtype: "addSong",
    data: e
  }
  var json = JSON.stringify(obj);
  if (obj.partyid) {
    sendMessage(json);
  }
}

var socket = io.connect('http://' + document.domain + ':' + location.port);
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
