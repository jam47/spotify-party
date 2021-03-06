import string
import random
import time

import json

from spotipy import SpotifyException

from Room import PartyRoom
from API_Handler_Search import SearchHandler

from flask_socketio import close_room, emit, join_room

#from a import socketio, hosts

SILENT_TRACK_URI = "spotify:track:7cctPQS83y620UQtMd1ilL"
partyids = {}

def parse(strMsg):
    msg = json.loads(strMsg)
    print(msg)
    if msg["rtype"] == "checkIfPartyExists":
        return json.dumps(checkIfPartyExists(msg["partyid"]))
    if "partyid" in  msg:
        if msg["partyid"] in partyids:
            if partyids[msg["partyid"]].isActive():
                switcher = {
                    "addSong":addSong,
                    "closeRoom":closeRoom,
                    "startPlayback":startPlayback,
                    "getSearchResults":getSearchResults,
                    "sendVote":addVotes,
                    "auth":getRedirectUrl,
                    "getDevices":getDevices,
                    "getSongs":getCurrentSongsOrdered,
                    "setAuthToken":proccessAuthenicationURL,
                    "getPartyName": getPartyName
                }
                function = switcher.get(msg["rtype"], lambda: print("Invalid type"))
                return json.dumps(function(msg["partyid"], msg["data"]))
            else:
                return json.dumps(redirect_shutdown())
        if msg["rtype"] == "createRoom":
            return json.dumps(createRoom(msg["data"]))
        else:
            return json.dumps(redirect_shutdown())

def getPartyName(partyid, data):
    return {
        "rtype": "setPartyName",
        "data": partyids[partyid].party_name
    }

def redirect_shutdown():
    return {
                "rtype": "redirectShutdown"
            }

def addSong(partyid, data):
    partyids[partyid].addSong(data)



def createRoom(room_name):
    while True:
        code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if code not in partyids:
            break
    partyids[code] = PartyRoom(room_name, code)
    join_room(code)
    return {
        "rtype":"roomCode",
        "data": {
            "code": code,
            "sid": "",
        }
    }

def closeRoom(partyid, data):
    partyids[partyid].setInactive()

def proccessAuthenicationURL(partyid, data):
    print(data)
    token = partyids[partyid].playbackHandler.get_auth_token(data)
    if token:
        partyids[partyid].authenticate(token)
        return {
            "rtype":"authenticated",
            "data":""
        }


def getDevices(partyid,  data):
    return {
        "rtype":"setDevices",
        "data": partyids[partyid].playbackHandler.get_device_names()
    }


def startPlayback(partyid, data):
    room = partyids[partyid]
    firstSongToPlay = room.getMostUpvotedNotPlayedToPlay()
    secondSongToPlay = room.getMostUpvotedNotPlayedToPlay()
    room.setCurrentlyPlayingSong(firstSongToPlay)
    room.playbackHandler.create_playlist()
    room.playbackHandler.add_song_end(firstSongToPlay)
    room.playbackHandler.add_song_end(secondSongToPlay)
    room.playbackHandler.add_song_end(SILENT_TRACK_URI)
    room.playbackHandler.start_playback(device_id=data)
    partyids[partyid].started = True
    partyids[partyid].queuedSong = secondSongToPlay



#Negative number of votes for downvotes
def addVotes(partyid, data):
    partyids[partyid].modifySongVotes(data["uri"], data["voteMod"])


def getSearchResults(partyid, data):
    print("Searching for results")
    sh = SearchHandler()
    result = sh.search_track(data)
    result = sh.trim_result(result)
    print(result)
    return {"rtype":"searchResult","data":result}

def getCurrentSongsOrdered(partyid,data):
    print("GETTING CURRENT ORDERED SONGS")
    print(partyid)
    print(partyids[partyid])
    print(partyids[partyid].getCurrentUnplayedSongsInDescVotes())
    return {
        "rtype" : "songList",
        "data": partyids[partyid].getCurrentUnplayedSongsInDescVotes()
    }

def mainLoop():
    while True:
        updateAllPlaylists()
        removeInactivePlaylists()
        time.sleep(1)

def getRedirectUrl(partyid, data):
    if partyids[partyid].playbackHandler.get_cached_token():
        partyids[partyid].playbackHandler.remove_cache()

    print(partyids[partyid].playbackHandler.get_auth_url())
    url = partyids[partyid].playbackHandler.get_auth_url()
    return {
            "rtype":"auth",
            "data":url
        }

def checkIfPartyExists(partyid):
    if partyid in partyids:
        return {
            "rtype": "partyExists",
            "data": partyid
        }
    else:
        return {
            "rtype" : "partyNonexistent",
            "data" : partyid
        }




# def setAuthToken(partyid, data):
#     partyids[partyid].playbackHandler.authenticate(data)
#     print("FINISHED AUTHENTICATION with code", data)

def removeInactivePlaylists():
    inactive = getInactivePlaylistIds()
    for inactiveId in inactive:
        try:
            if partyids[inactiveId].playbackHandler.check_playlist_exists():
                partyids[inactiveId].playbackHandler.delete_playlist()
            
            partyids[inactiveId].playbackHandler.remove_cache()
        except TypeError:
            print("tried to remove a playlist but no token existed")
        
        #socketio.close_room(inactiveId)
        #for host_sid in hosts:
        #    if hosts[host_sid] == inactiveId:
        #        hosts.pop(host_sid)
        partyids.pop(inactiveId)
        print("REMOVED INACTIVE PARTY " + inactiveId)

def getInactivePlaylistIds():
    inactive = []
    for partyId in partyids:
        if not partyids[partyId].isActive():
            inactive.append(partyId)
    return inactive

def updateAllPlaylists():
    print(partyids)
    for partyId in partyids:
        if partyids[partyId].started and partyids[partyId].currentlyPlayingSong != None:
            partyids[partyId].playbackHandler.refreshPlaylist()
            if not partyids[partyId].paused:
                actual_uri_playing = partyids[partyId].playbackHandler.currently_playing_uri()
                if partyids[partyId].currentlyPlayingSong != actual_uri_playing:
                    print("NOT SAME SONG")
                    if actual_uri_playing == partyids[partyId].queuedSong:
                        if not partyids[partyId].missingSong:
                            nextToPlay = partyids[partyId].getMostUpvotedNotPlayedToPlay()

                            #update previous song and current song
                            previousSongUri = partyids[partyId].currentlyPlayingSong
                            partyids[partyId].currentlyPlayingSong = actual_uri_playing
                            if nextToPlay != None:
                                partyids[partyId].playbackHandler.add_song_end(nextToPlay)
                            else:
                                partyids[partyId].missingSong = True
                            partyids[partyId].playbackHandler.remove_song(previousSongUri)
                            if partyids[partyId].currentlyPlayingSong == SILENT_TRACK_URI:
                                #not second song playing
                                partyids[partyId].playbackHandler.remove_song(SILENT_TRACK_URI)
                                partyids[partyId].playbackHandler.add_song_offset(SILENT_TRACK_URI, 1)
                                partyids[partyId].currentlyPlayingSong = partyids[partyId].playbackHandler.get_uri_playlist_offset(0)
                                partyids[partyId].playbackHandler.start_playback()

                            partyids[partyId].queuedSong = SILENT_TRACK_URI
                        else:
                            if partyids[partyId].getNumberOfUnplayedSongs() < 2:
                                if not partyids[partyId].paused:
                                    previousSongUri = partyids[partyId].currentlyPlayingSong
                                    partyids[partyId].playbackHandler.remove_song(previousSongUri)
                                    partyids[partyId].playbackHandler.pause_playback()

                                    partyids[partyId].paused = True
                            else:
                                previousSongUri = partyids[partyId].currentlyPlayingSong
                                partyids[partyId].playbackHandler.remove_song(previousSongUri)
                                partyids[partyId].playbackHandler.remove_song(SILENT_TRACK_URI)
                                firstSongToPlay = partyids[partyId].getMostUpvotedNotPlayedToPlay()
                                secondSongToPlay = partyids[partyId].getMostUpvotedNotPlayedToPlay()
                                partyids[partyId].setCurrentlyPlayingSong(firstSongToPlay)
                                partyids[partyId].playbackHandler.add_song_end(firstSongToPlay)
                                partyids[partyId].playbackHandler.add_song_end(secondSongToPlay)
                                partyids[partyId].playbackHandler.add_song_end(SILENT_TRACK_URI)
                                partyids[partyId].playbackHandler.start_playback()
                                partyids[partyId].queuedSong = secondSongToPlay
                                partyids[partyId].paused = False
                                partyids[partyId].missingSong = False

                    else:
                        #if playing song deviates from those set then either lost connection or user has overridden playing songs, in either case quit party
                        partyids[partyId].setInactive()
            else:
                actual_uri_playing = partyids[partyId].playbackHandler.currently_playing_uri()
                #print("not expected uri playing , playing " + actual_uri_playing)
                if actual_uri_playing == SILENT_TRACK_URI or actual_uri_playing == None:
                    if partyids[partyId].getNumberOfUnplayedSongs() >= 2 and partyids[partyId].playbackHandler.get_active_device() != None:
                        partyids[partyId].playbackHandler.remove_song(SILENT_TRACK_URI)
                        firstSongToPlay = partyids[partyId].getMostUpvotedNotPlayedToPlay()
                        secondSongToPlay = partyids[partyId].getMostUpvotedNotPlayedToPlay()
                        partyids[partyId].setCurrentlyPlayingSong(firstSongToPlay)
                        partyids[partyId].playbackHandler.add_song_end(firstSongToPlay)
                        partyids[partyId].playbackHandler.add_song_end(secondSongToPlay)
                        partyids[partyId].playbackHandler.add_song_end(SILENT_TRACK_URI)
                        partyids[partyId].playbackHandler.start_playback()
                        partyids[partyId].queuedSong = secondSongToPlay
                        partyids[partyId].paused = False
                        partyids[partyId].missingSong = False
                    elif partyids[partyId].playbackHandler.currently_playing_uri() != None and not partyids[partyId].playbackHandler.check_if_paused():
                        try :
                            partyids[partyId].playbackHandler.pause_playback()
                        except SpotifyException:
                            print("attempted to pause playback whilst already paused due to spotify api delay")
                else:
                    partyids[partyId].setInactive()

