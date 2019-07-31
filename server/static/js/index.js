
//adapted from https://codepen.io/jryancard/pen/xYQNZG
//Setup canvas, drawing functions

 const colors = [ '#D8589F', '#EE4523', '#FBE75D', '#4FC5DF'];
 const bubbles = 80;

 const explode = (x, y) => {

     let particles = [];
     let ratio = window.devicePixelRatio;
     let c = document.createElement('canvas');
     let ctx = c.getContext('2d');

     c.style.position = 'absolute';
     c.style.left = (x) + 'px';
     c.style.top = (y ) + 'px';
     c.style.pointerEvents = 'none';
     c.style.width = 500 + 'px';
     c.style.height = 900 + 'px';
     c.style.zIndex = 9999;
     c.width = 500 * ratio;
     c.height = 900 * ratio;
     document.body.appendChild(c);

     for(var i = 0; i < bubbles; i++) {
         particles.push({
             x: c.width / 2,
             y: c.height / r(2, 4),
             radius: r(3, 8),
             color: colors[Math.floor(Math.random() * colors.length)],
             rotation: r(230, 310, true),
             speed: r(3, 7),
             friction: .99,
             fade: .03,
             opacity: r(100, 100, true),
             yVel: 0,
             gravity: 0.04
         });
     }

     render(particles, ctx, c.width, c.height);
     setTimeout(() => document.body.removeChild(c), 5000);
 }

 const render = (particles, ctx, width, height) => {
     requestAnimationFrame(() => render(particles, ctx, width, height));
     ctx.clearRect(0, 0, width, height);

     particles.forEach((p, i) => {
         p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
         p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);

         p.opacity -= 0.005;
         p.speed *= p.friction;
         p.radius -= p.fade;
         p.yVel += p.gravity;
         p.y += p.yVel;

         if(p.opacity < 0 || p.radius < 0) return;

         ctx.beginPath();
         ctx.globalAlpha = p.opacity;
         ctx.fillStyle = p.color;
         ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);
         ctx.fill();
     });

     return ctx;
 }

 const r = (a, b, c) => parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));


//Run the thing
const party_text = document.getElementById('main_party_txt');
party_text.addEventListener('animationend', (e) => {
  var bounding_rect = party_text.getBoundingClientRect();
 x = (bounding_rect.width / 2) - 250;
 y = bounding_rect.top + (bounding_rect.height / 2) - 450 + 100;
 explode(x, y);
 const buttons = document.getElementsByClassName('button_div');
 var i;
  for (i = 0; i < buttons.length; i++) {
    buttons[i].style.webkitAnimationPlayState = "running";
  }
});
var N_CHAR_PCODE = 6;

function createPartyBtn() {
  var partyNametxt = document.getElementById("partyNametxt");
  var partyNametxtstyle = window.getComputedStyle(partyNametxt);
  if (partyNametxtstyle.getPropertyValue("display") != "none") {
    //only accept letters numbers, spaces, - and _ as valid characters in party name
    if (/^[\w\-\s]+$/.test(partyNametxt.value)) {
      createParty(partyNametxt.value);
    } else {
      //display warning message
      var body = document.getElementsByTagName("BODY")[0];
      var already_present_warning = document.querySelector('.warning_msg');
      if (already_present_warning != null) {
        body.removeChild(already_present_warning);
      }
      // TODO: fix shake animation
      partyNametxt.classList.add("shake");
      partyNametxt.addEventListener("animationend", (e) => {
        partyNametxt.classList.remove("shake");
      });
      var warning_message_div = document.createElement("div");
      warning_message_div.innerHTML = "<p>Party name can only contain letters, numbers, spaces, hyphens and underscores.</p>";
      warning_message_div.className = "warning_msg";
      warning_message_div.style.color = "#ffae42";
      warning_message_div.style.textAlign = "center";
      warning_message_div.style.marginTop = "40px";
      body.appendChild(warning_message_div);
      var warning_message_p = warning_message_div.firstChild;
      warning_message_p.style.fontFamily = "proxima-nova, sans-serif";
    }
  } else {
    var party_create_btn = document.getElementById("create_party_btn");
    partyNametxt.style.display = "block";
    party_create_btn.style.webkitAnimationPlayState = "running";
    partyNametxt.style.webkitAnimationPlayState = "running";
    document.getElementById("partyNametxt").focus();
  }
}

function joinPartyBtn() {
  var joinPartyText = document.getElementById("partyCodetxt");
  var jointPartyTextStyle = window.getComputedStyle(joinPartyText);
  if (jointPartyTextStyle.getPropertyValue("display") != "none") {
    var valid_pcode_regex = new RegExp("^[A-Z0-9]{" + N_CHAR_PCODE + "}$")
    if (valid_pcode_regex.test(joinPartyText.value)) {
      var partyId = joinPartyText.value;
      request = {
        "partyid": partyId,
        "rtype": "checkIfPartyExists"
      };
      sendMessage(JSON.stringify(request));
    } else {
      var already_present_warning = document.querySelector('.warning_msg');
      var body = document.getElementsByTagName("BODY")[0];
      if (already_present_warning != null) {
        body.removeChild(already_present_warning);
      }
      var warning_message_div = document.createElement("div");
      warning_message_div.innerHTML = "<p>A valid party code contains a total of " + N_CHAR_PCODE + " uppercase letters and numbers.</p>";
      warning_message_div.className = "warning_msg";
      warning_message_div.style.color = "#ffae42";
      warning_message_div.style.textAlign = "center";
      warning_message_div.style.marginTop = "40px";
      body.appendChild(warning_message_div);
      var warning_message_p = warning_message_div.firstChild;
      warning_message_p.style.fontFamily = "proxima-nova, sans-serif";
    }
  } else {
    var party_join_btn = document.getElementById("join_party_btn");
    joinPartyText.style.display = "block";
    party_join_btn.style.webkitAnimationPlayState = "running";
    joinPartyText.style.webkitAnimationPlayState = "running";
    document.getElementById("partyCodetxt").focus();
  }
}

function displayPartyNonexistentError(partyid) {
  var already_present_warning = document.querySelector('.warning_msg');
  var body = document.getElementsByTagName("BODY")[0];
  if (already_present_warning != null) {
    body.removeChild(already_present_warning);
  }
  var warning_message_div = document.createElement("div");
  warning_message_div.innerHTML = "<p>" + partyid + " isn't an active party.</p>";
  warning_message_div.className = "warning_msg";
  warning_message_div.style.color = "#ffae42";
  warning_message_div.style.textAlign = "center";
  warning_message_div.style.marginTop = "40px";
  body.appendChild(warning_message_div);
  var warning_message_p = warning_message_div.firstChild;
  warning_message_p.style.fontFamily = "proxima-nova, sans-serif";
}

function createParty(partyName) {
  // request = {
  //   "partyid": "",
  //   "rtype": "createRoom",
  //   "data": party_name
  // };
  // sendMessage(JSON.stringify(request));
  socket.emit('create_room', {party_name: partyName});
}

function sendMessage(msg) {
  console.log("Sending: " + msg);
  socket.send(msg);
}

var socket = io.connect('http://' + document.domain + ':' + location.port, {secure: true});
socket.on('connect', function() {
  socket.emit('my event', {
    data: 'I\'m connected!'
  });
});
socket.on('message', function(msg) {
  message = JSON.parse(msg);
  if (message["rtype"] == "auth") {
    window.location = message["data"];
  } else if (message["rtype"] == "roomCode") {
    window.location = "/main-host.html?id=" + message["data"]["code"] + "\&sid=" + message["data"]["sid"];
  } else if (message["rtype"] == "partyExists") {
    window.location = "/main-member.html?id=" + message["data"]
  } else if (message["rtype"] == "partyNonexistent") {
    displayPartyNonexistentError(message["data"]);
  }
});
