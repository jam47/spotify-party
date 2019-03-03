from API_Handler_Playback import PlaybackHandler

class PartyRoom:

    DEFAULT_VOTES = 0
    def __init__(self, username):
        self.songList = []
        self.currentlyPlayingSong = None
        self.isActive = True
        self.playbackHandler = PlaybackHandler(username, "Spotify Party")
        self.username = username

    def addSong(self, jsonSong):
        votedSong = {
            "song": jsonSong,
            "votes": 0,
            "played": False
        }

        i = 0
        while self.songList[i]["votes"] > 0:
            i += 1
        self.songList.insert(i + 1, votedSong)

    def modifySongVotes(self, uri, voteModification):
        toModify = None
        for song in self.songList:
            if song["song"]["uri"] == uri:
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
                song["Played"] = True
                self.currentlyPlayingSong = song["song"]
                return song["song"]

    def isActive(self):
        return self.isActive

    def setInactive(self):
        self.isActive = False

    def getCurrentUnplayedSongsInDescVotes(self):
        currentUnplayedSongs = []

        for song in self.songList:
            if song["played"] == False:
                currentUnplayedSongs.append(song)

        return currentUnplayedSongs

    def setCurrentlyPlayingSong(self, currentlyPlayingSong):
        self.currentlyPlayingSong = currentlyPlayingSong
