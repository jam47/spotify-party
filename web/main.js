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
    e.prev().css("color", "#000000");
}
