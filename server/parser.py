import string
import random
import time
from .Room import PartyRoom
import json

partyids = {}

def parse(strMsg):
    msg = json.loads(strMsg)
    if (hosts[msg["partyid"]] in roomIds):
        switcher = {
            "addSong":addSong,
            "createRoom":createRoom,
            "closeRoom":closeRoom,
            "startPlayback":startPlayback,
            "getSearchResults":getSearchResults
        }
        function = switcher.get(msg["rtype"], lambda: print("Invalid type"))
        return json.dumps(function(msg["partyid"], msg["data"]))

def addSong(partyid, data):
    partyids[partyid].addSong(data)

def createRoom(partyid, data):
    while True:
        code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if code not in partyids:
            break
    partyIds[code] = Room(data["username"])
    return {"rtype":"roomCode", "data":code}

def closeRoom(partyid, data):
    partyids.pop(partyid)

def startPlayback(partyid, data):
    room = partyids[partyid]
    firstSongToPlay = room.getMostUpvotedNotPlayedToPlay()
    room.playbackHandler.addSong()
    room.playbackHandler.addSong(room.getMostUpvotedNotPlayedToPlay())
    room.setCurrentlyPlayingSong(firstSongToPlay)

#Negative number of votes for downvotes
def addVotes(self, partyid, uri, numberOfVotes):
    partyids[partyid].modifySongVotes(uri, numberOfVotes)


def getSearchResults(partyid, data):
    sh = SearchHandler()
    result = sh.search_track(data["searchTerm"])
    result = sh.trim_result(result)
    return {"rtype":"searchResult","data":result}

def deactivatePlaylist(self, partyid):
    partyids[partyid].setInactive()

def mainLoop():
    while True:
        updateAllPlaylists()
        time.sleep(1)

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
