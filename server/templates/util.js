var idGlob;
var deviceInterval;
var upvoteVotedColor = "rgb(0, 255, 0)";
var downvoteVotedColor = "rgb(255, 0, 0)";
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
      if (obj.data != "None") {
        //need to redirect to obtain authentication
        window.location = obj.data;
      } else {
        //user authentication already cached
        var url_string = window.location.href
        var url = new URL(url_string);
        var id = url.searchParams.get("id");
        idGlob = id;
        $("#parties").find(".1").addClass("active");
        $("#parties").find(".1").attr("id", id);
      }
    } else if (obj.rtype == "songList") {
      console.log("SETTING SONGS")
      setSongs(obj);
    } else if (obj.rtype == "authenticated") {
      startDeviceRequests();
    } else if (obj.rtype == "setDevices") {
      console.log("setting devices!")
      setDevices(obj);
    }
  }
});

function startDeviceRequests() {
  deviceInterval = setInterval(requestDevices, 3000);
  }

function requestDevices() {
  var obj = {
    partyid : idGlob,
    rtype : "getDevices",
    data : ""
  }
  var json = JSON.stringify(obj);
  if (obj.partyid){
    sendMessage(json);
  }
}

function setDevices(e) {
  var already_present_sbox_div = document.getElementById("device_selection_box_div");
  var deviceSelectionBox;
  var indexToRefreshDevices;
  if (already_present_sbox_div == null) {
    var deviceSelectionBoxDiv = document.createElement("div");
    deviceSelectionBoxDiv.classList.add("float-right");
    deviceSelectionBoxDiv.id = "device_selection_box_div";
    deviceSelectionBox = document.createElement("select");
    deviceSelectionBox.classList.add("hidden")
    deviceSelectionBox.id = "device_selection_box";
    var default_value = document.createElement("option");
    default_value.innerHTML = "Select a device";
    default_value.id = "default_device_val";
    deviceSelectionBox.appendChild(default_value);
    deviceSelectionBoxDiv.appendChild(deviceSelectionBox);
    document.getElementById("right-top-bar").appendChild(deviceSelectionBoxDiv);
    indexToRefreshDevices = 1;
  } else {
    deviceSelectionBox = already_present_sbox_div.childNodes[0];
    var selectionItem = deviceSelectionBox.childNodes[1];
    var div_eq_item = document.getElementById("devices_drop_down").childNodes[0 ];
    var n_found = 0;
    while (selectionItem != undefined) {
      var selectionItemValue =  selectionItem.innerHTML;
      var found = false;
      for (var i = 0; i < e.data.length; i++) {
        if (e.data[i].name == selectionItemValue) {
          e.data[i].name ="null";
          found = true;
          n_found++;
        }
      }
      if (!found) {
        deviceSelectionBox.removeChild(selectionItem);
        if (div_eq_item.classList.contains("same-as-selected-device")) {
          deviceSelectionBox.selectedIndex = 0;
          var header = document.getElementById("selected_devices_header");
          var arrow_div = header.childNodes[1];
          header.innerHTML = "Select a device";
          header.appendChild(arrow_div);
        }
        div_eq_item.remove();
      }
      selectionItem = deviceSelectionBox.childNodes[n_found + 1];
      div_eq_item = document.getElementById("devices_drop_down").childNodes[n_found];
    }
    indexToRefreshDevices = n_found + 1;
  }
  for (var i = 0; i < e.data.length; i++) {
    if (e.data[i].name != "null") {
      var selectionItem = document.createElement("option");
      selectionItem.innerHTML = e.data[i].name;
      selectionItem.value = e.data[i].id;
      deviceSelectionBox.appendChild(selectionItem);
    }
  }
  formatDevices(indexToRefreshDevices);
}

document.addEventListener("click", closeAllSelect);

function formatDevices(indexToRefreshDevices) {
  var x, i, j, selElmnt, a, b, c;
  /*look for any elements with the class "custom-select":*/
  x = document.getElementById("device_selection_box_div");
  selElmnt = x.getElementsByTagName("select")[0];

  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  if (document.getElementById("devices_drop_down") == null) {
    a.setAttribute("class", "selected_device");
    a.id = "selected_devices_header";
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x.appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.id = "devices_drop_down";
    b.setAttribute("class", "select-devices hidden");
    var arrow_div = document.createElement("DIV");
    arrow_div.setAttribute("class", "selected_device_arrow");
    a.appendChild(arrow_div);
  } else {
    b = document.getElementById("devices_drop_down");
  }

  for (j = indexToRefreshDevices; j < selElmnt.length; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, i, k, s, h;
        s = document.getElementById("device_selection_box_div").getElementsByTagName("select")[0];
        h = document.getElementById("selected_devices_header");
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            var arrow_div = h.childNodes[1];
            h.innerHTML = this.innerHTML;
            h.appendChild(arrow_div);
            y = this.parentNode.getElementsByClassName("same-as-selected-device");
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected-device");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  if (document.getElementById("devices_drop_down") == null) {
    x.appendChild(b);
  }
  a.addEventListener("click", function(e) {
  /*when the select box is clicked, close any other select boxes,
  and open/close the current select box:*/
  e.stopPropagation();
  document.getElementById("devices_drop_down").classList.toggle("hidden");
  this.classList.toggle("select-arrow-active");
});
}

function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-devices");
  y = document.getElementsByClassName("selected_devices_header");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("hidden");
    }
  }
}


function startPlayback(e) {
//// TODO: work out why requests are still happening
  clearInterval(requestDevices);
  var deviceSelectionBox = document.getElementById("device_selection_box");
  if (deviceSelectionBox.selectedIndex != 0) {
    // TODO: revalidate that device hasn't become unavailable
    var selected_id = deviceSelectionBox[deviceSelectionBox.selectedIndex]. value;
    var obj = {
      partyid : idGlob,
      rtype : "startPlayback",
      data : selected_id
    }
    var json = JSON.stringify(obj);
    if (obj.partyid){
      sendMessage(json);
    }
  } else {
    window.alert("Please select a devicea");
  }

}
function upvote(e){
  if (e.css("color") == "rgb(0, 255, 0)"){
    e.css("color","#000000");
    var obj = {
      partyid : idGlob,
      rtype : "sendVote",
      data : {
        uri : e.parent().parent().attr("id"),
        voteMod : -1.
      }
    }
    var json = JSON.stringify(obj);
    console.log("REMOVING UPVOTE");
    if (obj.partyid){
      sendMessage(json);
    }
  } else {
    setUpvoteVotedColor(e);
    var obj = {
      partyid : idGlob,
      rtype : "sendVote",

      data : {
        uri : e.parent().parent().attr("id"),
        voteMod : 1 + (e.next().css("color") == "rgb(255, 0, 0)")

      }
    }
    var json = JSON.stringify(obj);
    console.log("SETTING UPVOTE");
    if (obj.partyid){
      sendMessage(json);
    }
    e.next().css("color","#000000");
  }
}
function downvote(e){
  if (e.css("color") == "rgb(255, 0, 0)"){
    e.css("color","#000000");
    var obj = {
      partyid : idGlob,
      rtype : "sendVote",
      data : {
        uri : e.parent().parent().attr("id"),
        voteMod : 1
      }
    }
    var json = JSON.stringify(obj);
    console.log("REMOVING DOWNVOTE");
    if (obj.partyid){
      sendMessage(json);
    }
  }
  else {
    setDownvoteVotedColor(e);
    var obj = {
      partyid : idGlob,
      rtype : "sendVote",
      data : {
        uri : e.parent().parent().attr("id"),
        voteMod : -1 - (e.prev().css("color") == "rgb(0, 255, 0)")
      }
    }
    console.log("SETTING DOWNVOTE");
    var json = JSON.stringify(obj);
    if (obj.partyid){
      sendMessage(json);
    }
    e.prev().css("color", "#000000");
  }
}

function setUpvoteVotedColor(upvote){
  upvote.css("color",upvoteVotedColor);
}

function setDownvoteVotedColor(downvote) {
  downvote.css("color",downvoteVotedColor);
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
  console.log("GETTING SONGS STILL TO PLAY")

  sendMessage(json);

}
function setParty(e){
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

function setSongs(e){
  var myNode = $("#tracks");
  for (i in e.data){
    e.data[i].userVote = previousSongUserVote(e.data[i].uri);
  }
  while (myNode[0].children[0]) {
      myNode[0].removeChild(myNode[0].children[0]);
  }
  for (i in e.data){
      var html_out = "<li class='list-group-item' id=" + e.data[i].uri + ">" +
      e.data[i].name + " - " +  e.data[i].artists + " (" + e.data[i].album + ")" +
      "<i class=\"material-icons float-right\">" +
      "<span class=\"thup\" onclick=\"upvote($(this))\">" +
      " thumb_up" +
      "</span>" +
      "<span class=\"thdn\" onclick=\"downvote($(this))\">" +
      " thumb_down" +
      "</span>" +
      "</i>" +
      "</li>"
      $("#tracks").append(html_out);
      if (e.data[i].userVote == 1) {
        setUpvoteVotedColor($($("#tracks")[0].lastChild.getElementsByClassName("thup")));
      } else if (e.data[i].userVote == -1) {
        setDownvoteVotedColor($($("#tracks")[0].lastChild.getElementsByClassName("thdn")));
      }
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
