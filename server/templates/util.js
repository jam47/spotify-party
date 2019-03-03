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
    if (obj.rtype == "Playlist"){
	setSongs(obj);
    }
    if (obj.rtype == "searchResults"){
	setSearch(obj);
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
     if (obj.partyid){
	sendMessage(json);
    }
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
    if (obj.partyid){
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
function search(e){
    	var obj = {
	    partyid : $("#parties").find(".active").attr("id"),
	    rtype : "getSearchResults",
	    data : e
	}
	var json = JSON.stringify(obj);
	if (obj.partyid){
	    sendMessage(json);
	}

}
function setSearch(e){
    for (i in e.data){
	var html_out = `<li class='list-group-item' id='${i.uri}'>
${i.name} - ${i.artists} (${i.album})
			<button type="button" class="btn btn-primary float-right" onclick="addSong($(this).parent().attr('id'))">
			  Add
			</button>
	    </li>`
	$("#results").append(html_out);
    }
}
function addSong(e){
        var obj = {
	    partyid : $("#parties").find(".active").attr("id"),
	    rtype : "addSong",
	    data : e
	}
	var json = JSON.stringify(obj);
	if (obj.partyid){
	    sendMessage(json);
	}
}
