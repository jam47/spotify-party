
class PartyRoom:
    from ../src/API_Handler_Playback import PlaybackHandler
    DEFAULT_VOTES = 0
    def __init__(self, username):
        self.songList = []
        self.currentlyPlayingSong = None
        self.isActive = True
        self.playbackHandler = PlaybackHandler(username, "Spotify Party")

    def addSong(self, jsonSong):
        votedSong = {
            "song":jsonSong,
            "votes":0,
            "played":false
        }

        i = 0
        while (songList[i]["votes"] > 0):
            i++
        songList.insert(i + 1, votedSong)

    def modifySongVotes(self, uri, voteModification):
        toModify = None
        for song in songList:
            if (song["song"]["uri"] == uri):
                toModify = song
        if (toModify != None):
            songList.remove(toModify)
            toModify["votes"] += voteModification
            newVotes = toModify["votes"]
            i = 0
            while (songList[i]["votes"] > newVotes):
                i++
            songList.insert(i + 1, toModify)

    def getMostUpvotedNotPlayed():
        for song in songList:
            if (!song["played"])
                return song["song"]

    def isActive():
        return isActive
