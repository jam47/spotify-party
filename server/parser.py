import string
import random
import time
from Room import PartyRoom
import json
from API_Handler_Search import SearchHandler

partyids = {}

def parse(strMsg):
    msg = json.loads(strMsg)
    print(partyids)
    if msg["partyid"] in partyids:
        switcher = {
            "addSong":addSong,
            "closeRoom":closeRoom,
            "startPlayback":startPlayback,
            "getSearchResults":getSearchResults,
            "addVotes":addVotes,
            "auth":getRedirectUrl,
            "getSongs":getCurrentSongsOrdered
        }
        function = switcher.get(msg["rtype"], lambda: print("Invalid type"))
        return json.dumps(function(msg["partyid"], msg["data"]))
    if msg["rtype"] == "createRoom":
        return json.dumps(createRoom(msg["data"]))

def addSong(partyid, data):
    partyids[partyid].addSong(data)

def createRoom(username):
    while True:
        code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if code not in partyids:
            break
    partyids[code] = PartyRoom(username)
    return {
        "rtype":"roomCode",
        "data":code
    }

def closeRoom(partyid, data):
    partyids[data["partyid"]].setInactive()

def proccessAuthenicationURL(partyid, data):
    token = partyids[partyid].playbackHandler.get_auth_token(data["authURL"])
    if token:
        partyids[partyid].playbackHandler.authenticate(token)


def startPlayback(partyid, data):
    room = partyids[partyid]
    firstSongToPlay = room.getMostUpvotedNotPlayedToPlay()
    room.playbackHandler.addSong()
    room.playbackHandler.addSong(room.getMostUpvotedNotPlayedToPlay())
    room.setCurrentlyPlayingSong(firstSongToPlay)

#Negative number of votes for downvotes
def addVotes(partyid, data):
    partyids[partyid].modifySongVotes(data["uri"], data["numberOfVotes"])


def getSearchResults(partyid, data):
    sh = SearchHandler()
    result = sh.search_track(data)
    result = sh.trim_result(result)
    print(result)
    return {"rtype":"searchResult","data":result}

def getCurrentSongsOrdered(partyid,data):
    result = sh.search_track(data["searchTerm"])
    return {
        "rtype":"songList",
        "data":partyids[partyid].getCurrentUnplayedSongsInDescVotes()
    }

def mainLoop():
    while True:
        updateAllPlaylists()
        time.sleep(1)

def getRedirectUrl(partyid, data):
    if not partyids[partyid].playbackHandler.get_cached_token():
        print(partyids[partyid].playbackHandler.get_auth_url())
        url = partyids[partyid].playbackHandler.get_auth_url()
        return {
                "rtype":"auth",
                "data":url
            }
    else:
        print("No Token!")
        return None


def updateAllPlaylists():
    for partyId in partyids:
        if (partyids[partyId].isActive()):
            if partyids[partyId].currentlyPlayingSong["uri"] != partyids[partyId].playbackHandler.currently_playing_uri():
                previousSongUri = partyids[partyId].currentlyPlayingSong["uri"]
                partyids[partyId].playbackHandler.add_song(partyids[partyId].getMostUpvotedNotPlayed())
                partyids[partyId].playbackHandler.remove_song(previousSongUri)
        else:
            partyids[partyId].playbackHandler.delete_playlist()
            partyids.pop(partyId)
