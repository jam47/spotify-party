from API_Handler_Playback import PlaybackHandler
from API_Handler_Search import SearchHandler

class PartyRoom:

    DEFAULT_VOTES = 0
    def __init__(self, username):
        self.songList = []
        self.started = False
        self.currentlyPlayingSong = None
        self.isActiveVal = True
        self.playbackHandler = PlaybackHandler(username, "Spotify Party")
        self.username = username

    def addSong(self, jsonSong):
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



    def modifySongVotes(self, uri, voteModification):
        toModify = None
        for song in self.songList:
            if song["uri"] == uri:
                toModify = song
        if (toModify != None):
            self.songList.remove(toModify)
            toModify["votes"] += voteModification
            newVotes = toModify["votes"]
            i = 0
            while self.songList[i]["votes"] > newVotes:
                i += 1
            self.songList.insert(i + 1, toModify)

    def getMostUpvotedNotPlayedToPlay(self):
        for song in self.songList:
            if (not song["played"]):
                song["played"] = True
                return song["uri"]

    def isActive(self):
        return self.isActiveVal

    def setInactive(self):
        self.isActiveVal = False

    def getCurrentUnplayedSongsInDescVotes(self):
        currentUnplayedSongs = []

        for song in self.songList:
            if song["played"] == False:
                currentUnplayedSongs.append(song)

        return currentUnplayedSongs

    def setCurrentlyPlayingSong(self, currentlyPlayingSong):
        self.currentlyPlayingSong = currentlyPlayingSong
