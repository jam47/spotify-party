from server.API_Handler_Playback import PlaybackHandler
from server.API_Handler_Search import SearchHandler


class PartyRoom:

    DEFAULT_VOTES = 0
    def __init__(self, name, id):
        self.songList = []
        self.started = False
        self.currentlyPlayingSong = None
        self.isActiveVal = True
        self.id = id
        self.playbackHandler = PlaybackHandler("SpotifyParty:" + name, id)
        self.username = None
        self.party_name = name
        self.queuedSong = None
        self.missingSong = False
        self.paused = False

    def addSong(self, jsonSong):
        song_already_present = self.get_song_if_present(jsonSong)
        if song_already_present is not None:
            if song_already_present["played"]:
                self.removeSong(jsonSong)
            else:
                return
        sh = SearchHandler()
        result = sh.get_track_by_uri(jsonSong)
        votedSong = {
            "uri": jsonSong,
            "votes": 0,
            "played": False,
            "name": result.get("name"),
            "artists": [artist.get("name") for artist in result.get("artists")],
            "album": result.get("album").get("name"),
        }

        i = 0
        while len(self.songList) > i and self.songList[i]["votes"] > 0:
            i += 1

        if i == len(self.songList):
            self.songList.append(votedSong)
            print(self.songList)
        else:
            self.songList.insert(i + 1, votedSong)
            print(self.songList)


    def removeSong(self, uri):
        for i in range(0, len(self.songList)):
            if self.songList[i][uri] == uri:
                self.songList.pop(i)

    def get_song_if_present(self, uri):
        for song in self.songList:
            if song["uri"] == uri:
                return song
        return None

    def modifySongVotes(self, uri, voteModification):
        toModify = None
        for song in self.songList:
            if song["uri"] == uri:
                toModify = song
        if toModify != None and self.songList.__len__() > 1:
            self.songList.remove(toModify)
            toModify["votes"] += voteModification
            newVotes = toModify["votes"]
            i = 0
            while i < self.songList.__len__() and self.songList[i]["votes"] > newVotes:
                i += 1
            self.songList.insert(i, toModify)

    def getMostUpvotedNotPlayedToPlay(self):
        for song in self.songList:
            if not song["played"]:
                song["played"] = True
                return song["uri"]
        return None

    def isActive(self):
        return self.isActiveVal

    def setInactive(self):
        self.isActiveVal = False

    def getCurrentUnplayedSongsInDescVotes(self):
        currentUnplayedSongs = []

        for song in self.songList:
            if not song["played"]:
                currentUnplayedSongs.append(song)

        return currentUnplayedSongs

    def getNumberOfUnplayedSongs(self):
        numberOfUnplayedSongs = 0
        for song in self.songList:
            if not song["played"]:
                numberOfUnplayedSongs += 1
        return numberOfUnplayedSongs

    def setCurrentlyPlayingSong(self, currentlyPlayingSong):
        self.currentlyPlayingSong = currentlyPlayingSong

    def authenticate(self, token):
        self.playbackHandler.authenticate(token)
        username = self.playbackHandler.get_username_from_spotipy()
        self.username = username
        self.playbackHandler.username = username
