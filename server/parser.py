import string
import random

partyIds = {}

def parse(msg):
    if (hosts[msg["partyid"]] in roomIds):
        switcher = {
            "addSong":addSong,
            "createRoom":createRoom,
            "closeRoom":closeRoom,
            "startPlayback":startPlayback,
            "getSearchResults":getSearchResults
        }
        function = switcher.get(msg["rtype"], lambda: print("Invalid type"))
        return function(msg["partyid"], msg["data"])

def addSong(partyid, data):
    partyids[partyid].addSong(data)

def createRoom(partyid, data):
    while True:
        code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if code not in partyIds:
            break
    partyIds[code] = Room(data["username"])

def closeRoom(partyid, data):
    partyIds.pop(partyid)

def startPlayback(partyid, data):
    room = roomIds[partyid]
    room.playbackHandler.addSong(room.songList[0]["uri"])
    room.songList = room.songList[1:]
    room.playbackHandler.addSong(room.songList[0]["uri"])
    room.songList = room.songList[1:]


def getSearchResults(partyid, data):
    roomids[partyid]
