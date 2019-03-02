import string
import random
import json

partyIds = {}

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
        if code not in partyIds:
            break
    partyIds[code] = Room(data["username"])
    return {"rtype":"roomCode", "data":code}

def closeRoom(partyid, data):
    partyIds.pop(partyid)

def startPlayback(partyid, data):
    room = roomIds[partyid]
    room.playbackHandler.addSong(room.songList[0]["uri"])
    room.songList = room.songList[1:]
    room.playbackHandler.addSong(room.songList[0]["uri"])
    room.songList = room.songList[1:]


def getSearchResults(partyid, data):
    sh = SearchHandler()
    result = sh.search_track(data["searchTerm"])
    result = sh.trim_result(result)
    return {"rtype":"searchResult","data":result}
