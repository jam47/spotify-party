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
    });
function upvote(e){
    if (e.css("color") == "rgb(0, 255, 0)"){
	e.css("color","#000000");
	var obj = {
	    songid : e.parent().attr("id"),
	    vote : -1
	}
	var json = JSON.stringify(obj);
    } else {
	e.css("color","#00ff00");
	var obj = {
	    songid : e.parent().attr("id"),
	    vote : 1
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
	    songid : e.parent().attr("id"),
	    vote : 1
	}
	var json = JSON.stringify(obj);

    } else {
	e.css("color","#ff0000");
	var obj = {
	    songid : e.parent().attr("id"),
	    vote : -1
	}
	var json = JSON.stringify(obj);
    }
    sendMessage(json);
    e.prev().css("color", "#000000");
}
function start(){
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
