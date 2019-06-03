var playing = false

var socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('connect', function() {
  socket.emit('my event', {
    data: 'I\'m connected!'
  });
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
    } else if (obj.rtype == "auth") {
      console.log("REDIRECTING TO AUTH URL")
      //need to redirect to obtain authentication
      window.location = obj.data;
    } else if (obj.rtype == "songList") {
      console.log("SETTING SONGS")
      setSongs(obj);
    } else if (obj.rtype == "authenticated") {
      startDeviceRequests();
    } else if (obj.rtype == "setDevices") {
      if (!playing) {
        console.log("setting devices!")
        setDevices(obj);
      }
    } else if (obj.rtype == "setPartyName") {
      setPartyName(obj);
    } else if (obj.rtype == "redirectShutdown") {
      window.location = "/party-shutdown.html";
    }
  }
});

function requestDevices() {
  var obj = {
    partyid: idGlob,
    rtype: "getDevices",
    data: ""
  }
  var json = JSON.stringify(obj);
  if (obj.partyid) {
    sendMessage(json);
  }
}

function startDeviceRequests() {
  deviceInterval = setInterval(requestDevices, 3000);
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
    var div_eq_item = document.getElementById("devices_drop_down").childNodes[0];
    var n_found = 0;
    while (selectionItem != undefined) {
      var selectionItemValue = selectionItem.innerHTML;
      var found = false;
      for (var i = 0; i < e.data.length; i++) {
        if (e.data[i].name == selectionItemValue) {
          e.data[i].name = "null";
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

function playStopPress(e) {
  var play_stop_icon = document.getElementById("play-stop-icon");
  var iconState = play_stop_icon.innerHTML;
  if (iconState == "play_circle_filled") {
    startPlayback(e);
  } else if (iconState == "stop") {
    if (confirm("Are you sure you want\nto shut the party down?")) {
      closeRoom();
      window.location = "/party-shutdown.html";
    }
  }
}

function closeRoom() {
  var obj = {
    partyid: idGlob,
    rtype: "closeRoom",
    data: ""
  }
  var json = JSON.stringify(obj);
  if (obj.partyid) {
    sendMessage(json);
  }
}

function startPlayback(e) {

  var deviceSelectionBox = document.getElementById("device_selection_box");
  if (deviceSelectionBox.selectedIndex != 0) {
    var tracks = document.getElementById("tracks")
    var number_of_songs = tracks.children.length
    if (number_of_songs >= 2) {
      clearInterval(deviceInterval);
      playing = true
      // TODO: revalidate that device hasn't become unavailable
      var selected_id = deviceSelectionBox[deviceSelectionBox.selectedIndex].value;
      var obj = {
        partyid: idGlob,
        rtype: "startPlayback",
        data: selected_id
      }
      var json = JSON.stringify(obj);
      if (obj.partyid) {
        sendMessage(json);
      }
      var icon = document.getElementById("play-stop-icon")
      icon.innerHTML = "stop"
      var device_s_box_div = document.getElementById("device_selection_box_div");
      device_s_box_div.remove();
      closeAllSelect()
    } else {
      window.alert("You must add at least 2 songs to start a party");
    }

  } else {
    window.alert("Please select a device");
  }

}


function start() {
  var url_string = window.location.href
  var url = new URL(url_string);
  var id = url.searchParams.get("id");
  if (id != undefined && id != null) {
    // idAttribute = ;
    document.cookie = "id=" + id;
    authRequest = {
      "partyid": id,
      "rtype": "auth",
      "data": ""
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

    var error = url.searchParams.get("error");

    if (error == null) {
      var authCode = url.searchParams.get("code");
      authTokenData = {
        "partyid": id,
        "rtype": "setAuthToken",
        "data": authCode
      }
      strAuthTokenData = JSON.stringify(authTokenData);
      sendMessage(strAuthTokenData);

      var name_request = {
        "partyid": id,
        "rtype": "getPartyName",
        "data": ""
      }
      sendMessage(JSON.stringify(name_request));
      var unimportant = setInterval(() => {
        getSongs(idGlob)
      }, 2000);
      setInterval(sendConnectionNotice, 3000);
    } else {
      closeRoom();
      window.location = "/start-join-party.html"
    }
  }


}

function sendConnectionNotice() {
  socket.emit('host_connected', idGlob);
}
